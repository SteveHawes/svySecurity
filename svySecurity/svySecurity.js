/**
 * @protected 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"6BE0C9D3-A073-4B3E-BED4-183542BA5B7B"}
 */
var sessionID = null;

/**
 * @protected 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"626CE06E-AF5A-42A1-8F8F-BE308B37F213"}
 */
var activeTenantName = null;

/**
 * @protected 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"A6511E73-F3FD-4A19-97F3-D9B55493F853"}
 */
var activeUserName = null;

/**
 * The interval (milliseconds) for an active session to update the ping time in the database
 * TODO should be externalized? Should be stored in db, so next expected time should be calculated ?
 * @private 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"9D18DE69-F778-4117-B8B3-0FCFF75E3B83",variableType:4}
 */
var SESSION_PING_INTERVAL = 10000;

/**
 * The default timeout (milliseconds) for a session. 
 * An unterminated session is deemed inactive/abandoned if it is not terminated within this amount of time from the time of last client ping
 * 
 * @private 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"263D0C4F-2EA9-4A85-9AB0-E757D276FF04",variableType:8}
 */
var SESSION_TIMEOUT = 30 * 60 * 1000; 

/**
 * Default user name for creation user audit fields when no user present
 * 
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"92742CC7-4C88-4CFE-8A4F-9AD555927665"}
 */
var SYSTEM_USER = 'system_user';

/**
 * @public 
 * @param {User} user
 * @return {Boolean}
 * @properties={typeid:24,uuid:"83266E3D-BB41-416F-988C-964593F1F33C"}
 */
function login(user){
	
	// already logged-in
	if(security.getUserUID()){
		// TODO logging
		application.output('Already logged-in', LOGGINGLEVEL.WARNING);
		return false;
	}

	// sync permissions
	// TODO Necessary to do here ?
	syncPermissions();
	
	// get internal groups
	var servoyGroups = [];
	var permissions = user.getPermissions();
	for(var i in permissions){
		servoyGroups.push(permissions[i].getName());
	}
	
	// no groups
	if(!servoyGroups.length){
		application.output('No Permissions. Cannot login', LOGGINGLEVEL.WARNING);
		return false;
	}
	
	// create session
	initSession(user);
	
	// filter security tables
	filterSecurityTables();
	
	// login
	if(!security.login(user.getUserName(),user.getUserName(),servoyGroups)){
		// TODO logging
		return false;
	}
	
	return true;
}

/**
 * Logs the current user out of the application
 * @public 
 * 
 * @properties={typeid:24,uuid:"341F328D-C8A6-4568-BF0C-F807A19B8977"}
 */
function logout(){
	closeSession();
	security.logout();
}

/**
 * Creates a new tenant with the specified name
 * 
 * @public 
 * @param {String} name The name of the tenant. Must be unique.
 * @return {Tenant} The tenant that is created
 * 
 * @properties={typeid:24,uuid:"2093C23A-D1E5-49D2-AA0B-428D5CB8B0FA"}
 */
function createTenant(name){
	
	if(!name){
		throw 'Name cannot be null or empty';
	}
	if(getTenant(name)){
		throw 'Tenant name "'+name+'" is not unique';
	}
	var fs = datasources.db.svy_security.tenants.getFoundSet();
	fs.newRecord();
	fs.tenant_name = name;
	if(!fs.creation_user_name){
		// TODO log warning ?
		fs.creation_user_name = SYSTEM_USER;
	}
	save(fs);
	return new Tenant(fs.getSelectedRecord());
}

/**
 * Get all the tenants in the system
 * @public 
 * @return {Array<Tenant>}
 *
 * @properties={typeid:24,uuid:"449FDFC0-DD1A-46EB-A576-2D6771C1BEBD"}
 */
function getTenants(){
	var tenants = [];
	var fs = datasources.db.svy_security.tenants.getFoundSet();
	fs.loadAllRecords();
	for (var i = 1; i <= fs.getSize(); i++) {
		var record = fs.getRecord(i);
		tenants.push(new Tenant(record));
	}
	return tenants;
}

/**
 * Gets the specified tenant. If no tenant name is specified, the current tenant is returned
 * 
 * @public 
 * @param {String} [name] The name of the tenant to get. Or null to get the current tenant.
 * @return {Tenant} The tenant or null if not found / no logged-in user
 * 
 * @properties={typeid:24,uuid:"35A8C27C-1B0E-478F-95E2-B068FBF57BB4"}
 * @AllowToRunInFind
 */
function getTenant(name){
	
	// no name, look for current user's tenant
	if(!name){

		// No logged-in user/tenant
		if(!utils.hasRecords(active_tenant)){
			return null;
		}
		
		// get user's tenant
		return new Tenant(active_tenant.getRecord(1));
	}
	
	// lookup tenant by name
	var fs = datasources.db.svy_security.tenants.getFoundSet();
	fs.find();
	fs.tenant_name = name;
	
	// no match
	if(!fs.search()){
		return null;
	}
	
	// get matching tenant
	return new Tenant(fs.getSelectedRecord());
}

/**
 * NOTE: USE WITH CAUTION! There is no undo.
 * Immediately and permanently deletes the specified tenant and all supporting records, including all users and roles
 * Tenant will not be deleted if it has users w/ active sessions
 * 
 * @public 
 * @param {Tenant} tenant
 * @return {Boolean} False if tenant was unable to be deleted, most commonly because of active sessions.
 * @properties={typeid:24,uuid:"416DAE0D-25B4-485F-BDB9-189B151EA1B9"}
 * @AllowToRunInFind
 */
function deleteTenant(tenant){
	if(tenant.getActiveSessions().length){
		application.output('Cannot delete tenant. Has active sessions',LOGGINGLEVEL.WARNING); // TODO Proper Logging
		return false;
	}
	var fs = datasources.db.svy_security.tenants.getFoundSet();
	fs.find();
	fs.tenant_name = tenant.getName();
	if(!fs.search()){
		application.output('Could not delete tenant. Unexpected could not find tenant "'+tenant.getName()+'".',LOGGINGLEVEL.ERROR); // TODO Proper Logging
		return false;
	}
	databaseManager.startTransaction();
	try{
		if(!fs.deleteRecord(1)){
			application.output('Could not delete tenant "'+tenant.getName()+'". Unkown error. Check log.',LOGGINGLEVEL.ERROR); // TODO Proper Logging
			return false;
		}
		if(!databaseManager.commitTransaction()){
			application.output('Could not delete tenant "'+tenant.getName()+'". Unkown error. Check log.',LOGGINGLEVEL.ERROR); // TODO Proper Logging
		}
		return true;
		
	}catch(e){
		databaseManager.rollbackTransaction();
		application.output('Could not delete tenant "'+tenant.getName()+'". Unkown error: '+e.message+'. Check log.',LOGGINGLEVEL.ERROR); // TODO Proper Logging
		return false;
	}
}

/**
 * Gets the user by specified username, or null to get the current logged-in user
 * 
 * @public 
 * @param {String} [userName] The username, can be null to get the current user
 * @param {String} [tenantName] The name of the tenant, can be null if username is also null when getting the current user
 * @return {User}
 * @properties={typeid:24,uuid:"FCF267E6-1580-402E-8252-ED18964474DA"}
 * @AllowToRunInFind
 */
function getUser(userName, tenantName){

	// Looking for logged-in user
	if(!userName){
		
		// no logged-in user
		if(!utils.hasRecords(active_user)){
			return null;
		}
		
		// get logged-in user
		return new User(active_user.getSelectedRecord());
	}
	
	// tenant not specified, use active tenant
	if(!tenantName){
		if(utils.hasRecords(active_tenant)){
			tenantName = active_tenant.tenant_name;
		} else {
			
		}
	}
	
	// get matching user
	var fs = datasources.db.svy_security.users.getFoundSet();
	fs.find();
	fs.user_name = userName;
	fs.tenant_name = tenantName;
	var results = fs.search();
	
	// no tenant and non-unique results
	if(results > 1){
		throw 'Calling getUser w/ no tenant supplied and no active tenant. Results may not be unique.';
	}
	
	// No Match
	if(results == 0){
		// TODO logging ?
		return null;
	}
	
	
	// cerate user object
	return new User(fs.getSelectedRecord());
}

/**
 * @public 
 * @return {Array<User>}
 * @properties={typeid:24,uuid:"6BF188EF-BC15-43AE-AB70-BB9A83FB2B18"}
 */
function getUsers(){
	var users = [];
	var fs = datasources.db.svy_security.users.getFoundSet();
	fs.sort('display_name asc')
	fs.loadAllRecords();
	for (var i = 1; i <= fs.getSize(); i++) {
		var record = fs.getRecord(i);
		users.push(new User(record));
	}
	return users;
}

/**
 * Gets all of the permissions in this application
 * 
 * @public 
 * @return {Array<Permission>}
 *
 * @properties={typeid:24,uuid:"08508668-696C-4BEF-8322-0884B2405FDF"}
 */
function getPermissions(){
	var permissions = [];
	var fs = datasources.db.svy_security.permissions.getFoundSet();
	fs.loadAllRecords();
	for (var i = 1; i <= fs.getSize(); i++) {
		var record = fs.getRecord(i);
		permissions.push(new Permission(record));
	}
	return permissions;
}

/**
 * Gets a permission by unique display name
 * 
 * @public 
 * @param {String} name The display name of the permission
 * @return {Permission} The permission or null if not found
 * 
 * @properties={typeid:24,uuid:"9008A7A4-154B-48A1-AF52-ED6CAFAADCBA"}
 * @AllowToRunInFind
 */
function getPermission(name){
	if(!name){
		throw 'Name cannot be null or empty';
	}
	var fs = datasources.db.svy_security.permissions.getFoundSet();
	fs.find();
	fs.permission_name = name;
	if(fs.search()){
		return new Permission(fs.getSelectedRecord());
	}
	return null;
}

/**
 * Gets the current session, null if no session initialized
 * NOTE: Sessions represent authenticated user sessions
 * They are not initialized until after login.
 *  
 * @public 
 * @return {Session}
 * @see login();
 * 
 * @properties={typeid:24,uuid:"41BC69E2-367B-439F-B0FE-B0B7A0533C24"}
 */
function getSession(){
	if(utils.hasRecords(active_session)){
		return new Session(active_session.getSelectedRecord());
	}
	return null;
}

/**
 * Gets all the active sessions for this system.
 * 
 * @public 
 * @return {Array<Session>}
 * @properties={typeid:24,uuid:"D3256103-0741-498E-9CA9-0E34E9D530E2"}
 */
function getActiveSessions(){
	var expiration = new Date();
	expiration.setTime(expiration.getTime() - SESSION_TIMEOUT); // i.e 30 min in the past
	var q = datasources.db.svy_security.sessions.createSelect();
	q.where
		.add(q.columns.session_end.isNull)
		.add(q.columns.last_client_ping.gt(expiration))
	var fs = datasources.db.svy_security.sessions.getFoundSet();
	fs.loadRecords(q);
	var sessions = [];
	for (var i = 1; i <= fs.getSize(); i++) {
		var sesh = fs.getRecord(i);
		sessions.push(new Session(sesh));
	}
	return sessions;
}

/**
 * Gets the number of unique logins this system has from any location at any time
 * @public 
 * @return {Number} 
 *
 * @properties={typeid:24,uuid:"6AAEA97C-C8FB-45FC-886C-1B43678C2F2C"}
 */
function getSessionCount(){
	var q = datasources.db.svy_security.sessions.createSelect();
	q.result.add(q.columns.id.count);
	return databaseManager.getDataSetByQuery(q,1).getValue(1,1);
}

/**
 * @private 
 * @param {JSRecord<db:/svy_security/tenants>} record
 * @constructor 
 * @properties={typeid:24,uuid:"BD7E0091-054F-434E-B5EE-44862926D03D"}
 * @AllowToRunInFind
 */
function Tenant(record){
	
	/**
	 * Creates a user with the specified user name
	 * 
	 * @public 
	 * @param {String} userName Must be unique in system
	 * @param {String} [password] Create user with password
	 * @return {User}
	 * @throws {String} If the user name is not unique
	 * @see User.setPassword
	 */
	this.createUser = function(userName, password){
		if(!userName){
			throw 'User name cannot be null or empty';
		}
		
		if(userNameExists(userName)){
			throw 'User Name "'+userName+'"is not unique';
		}
		
		if(record.tenants_to_users.newRecord() == -1){
			throw 'Failed to create record';
		}
		
		record.tenants_to_users.user_name = userName;
		if(!record.tenants_to_users.creation_user_name){
			// TODO log warning ?
			record.tenants_to_users.creation_user_name = SYSTEM_USER;
		}
		save(record.tenants_to_users)
				
		var user = new User(record.tenants_to_users.getSelectedRecord());
		if(password){
			user.setPassword(password);
		}
		return user;
	}
	
	/**
	 * Gets all the users for this tenant
	 * 
	 * @public 
	 * @return {Array<User>}
	 */
	this.getUsers = function(){
		var users = [];
		for (var i = 1; i <= record.tenants_to_users.getSize(); i++) {
			var user = record.tenants_to_users.getRecord(i);
			users.push(new User(user));
		}
		return users;
	}
	
	/**
	 * Gets the named user in this tenant
	 * 
	 * @public 
	 * @param {String} userName The unique name of the user
	 * @return {User} The matching user or null of not found
	 */
	this.getUser = function(userName){
		if(!userName){
			throw 'User name cannot be null or empty';
		}
		var users = this.getUsers();
		for(var i in users){
			var user = users[i];
			if(user.getUserName() == userName){
				return user;
			}
		}
		return null;
	}
	
	/**
	 * NOTE: USE WITH CAUTION! There is no undo.
	 * Immediately and permanently deletes the specified user and all supporting records
	 * User will not be deleted if it has active sessions
	 * 
	 * @public 
	 * @param {User|String} user
	 * @return {Boolean}
	 */
	this.deleteUser = function(user){
		var userName = user instanceof String ? user : user.getUserName();
		
		if(user.getActiveSessions().length){
			application.output('Could not delete user "'+userName+'". Has active sessions',LOGGINGLEVEL.WARNING); // TODO Proper Logging
			return false;
		}
		
		var fs = record.tenants_to_users.duplicateFoundSet();
		fs.find();
		fs.user_name = userName;
		if(!fs.search()){
			application.output('Could not delete user "'+userName+'". Unkown error. Check log.',LOGGINGLEVEL.ERROR); // TODO Proper Logging
			return false;
		}
		
		databaseManager.startTransaction();
		try{
			if(!fs.deleteRecord(1)){
				application.output('Could not delete user "'+userName+'". Unkown error. Check log.',LOGGINGLEVEL.ERROR); // TODO Proper Logging
				return false;
			}
			if(!databaseManager.commitTransaction()){
				application.output('Could not delete user "'+userName+'". Unkown error. Check log.',LOGGINGLEVEL.ERROR); // TODO Proper Logging
			}
			return true;
			
		}catch(e){
			databaseManager.rollbackTransaction();
			application.output('Could not delete user "'+userName+'". Unkown error: '+e.message+'. Check log.',LOGGINGLEVEL.ERROR); // TODO Proper Logging
			return false;
		}
	}
	
	/**
	 * Creates a role in this tenant with the specified name
	 * 
	 * @public 
	 * @param {String} name The name of the role. Must be unique in tenant
	 * @return {Role}
	 * @throws {String} If the role name is not unique
	 */
	this.createRole = function(name){
		if(!name){
			throw 'Role name cannot be null or empty';
		}
		if(this.getRole(name)){
			throw 'Role name "'+name+'" is not unique';
		}
		if(record.tenants_to_roles.newRecord() == -1){
			throw 'Could not create record';
		}
		record.tenants_to_roles.role_name = name;
		if(!record.tenants_to_roles.creation_user_name){
			// TODO Logging ?
			record.tenants_to_roles.creation_user_name = SYSTEM_USER;
		}
		save(record.tenants_to_roles);
		return new Role(record.tenants_to_roles.getSelectedRecord());
	}
	
	/**
	 * Gets a role by name unique to this tenant
	 * 
	 * @public
	 * @param {String} name the role name
	 * @return {Role} The matching role, or null if not found
	 */
	this.getRole = function(name){
		if(!name){
			throw 'Name cannot be null or empty';
		}
		var roles = this.getRoles();
		for(var i in roles){
			var role = roles[i];
			if(role.getName() == name){
				return role;
			}
		}
		return null;
	}
	
	/**
	 * Gets the roles for this tenant
	 * @public 
	 * @return {Array<Role>}
	 */
	this.getRoles = function(){
		var roles = [];
		for (var i = 1; i <= record.tenants_to_roles.getSize(); i++) {
			var role = record.tenants_to_roles.getRecord(i);
			roles.push(new Role(role));
		}
		return roles;
	}
	
	/**
	 * Deletes the role from this tenant. All associated permissions and grants to users are removed immediately.
	 * Users with active sessions will be affected, but design-time security (CRUD, UI) will not be affected until next log-in.
	 * 
	 * @public 
	 * @param {Role|String} role
	 * @return {Tenant}
	 */
	this.deleteRole = function(role){
		var roleName = role instanceof String ? role : role.getName();
		
		var fs = record.tenants_to_roles.duplicateFoundSet();
		if(!fs.find()){
			throw 'Role not deleted. Find failed';
		}
		fs.role_name = roleName;
		if(!fs.search()){
			throw 'Role '+roleName+' not found in tenant';
		}
		if(!fs.deleteRecord()){
			throw 'Role '+roleName+' could not be deleted. Check log for details';
		}
		return this;
	}
	
	/**
	 * Gets the name of this tenant which is unique in system
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getName = function(){
		return record.tenant_name;
	}
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getDisplayName = function(){
		return record.display_name;
	}
	
	/**
	 * @public 
	 * @param {String} displayName
	 * @return {Tenant}
	 */
	this.setDisplayName = function(displayName){
		record.display_name = displayName;
		save(record);
		return this;
	}
	
	/**
	 * Gets the active sessions for this tenant 
	 * This includes any sessions from any device or location
	 * NOTE: Any unterminated sessions are deemed to be active when they not been idle for more than a set timeout period
	 * 
	 * @public 
	 * @return {Array<Session>}
	 */
	this.getActiveSessions = function(){
		var expiration = new Date();
		expiration.setTime(expiration.getTime() - SESSION_TIMEOUT); // i.e 30 min in the past
		var q = record.tenants_to_sessions.getQuery();
		q.where
			.add(q.columns.session_end.isNull)
			.add(q.columns.last_client_ping.gt(expiration))
		var fs = datasources.db.svy_security.sessions.getFoundSet();
		fs.loadRecords(q);
		var sessions = [];
		for (var i = 1; i <= fs.getSize(); i++) {
			var sesh = fs.getRecord(i);
			sessions.push(new Session(sesh));
		}
		return sessions;
	}
	
	/**
	 * Gets the number of unique logins this tenant has from any location at any time
	 * @public 
	 * @return {Number} 
	 */
	this.getSessionCount = function(){
		return databaseManager.getFoundSetCount(record.tenants_to_sessions);
	}
	
	/**
	 * Locks the tenant account preventing its users from logging in
	 * Lock will remain in place until it expires or it is removed using unlock()
	 * Users with active sessions will be unaffected until subsequent login attempts
	 * 
	 * @public 
	 * @param {String} [reason]
	 * @param {Date} [expiration]
	 * @return {Tenant}
	 */
	this.lock = function(reason, expiration){
		record.lock_flag = 1;
		record.lock_reason = reason;
		record.lock_expiration = expiration;
		save(record);
		return this;
	}
	
	/**
	 * Removes any lock on the tenant account
	 * 
	 * @public 
	 * @return {Tenant}
	 */
	this.unlock = function(){
		record.lock_flag = null;
		record.lock_reason = null;
		record.lock_expiration = null;
		save(record);
		return this;
	}
	
	/**
	 * Indicates if a tenant account is locked
	 * 
	 * @public 
	 * @return {Boolean}
	 */
	this.isLocked = function(){
		return record.lock_flag == 1;
	}
	
	/**
	 * Indicates the reason for the lock.
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getLockReason = function(){
		return record.lock_reason;
	}
	
	/**
	 * Indicates the expiration time of the lock
	 * Lock will remain in place until it expires or it is removed using unlock()
	 * 
	 * @public 
	 * @return {Date}
	 */
	this.getLockExpiration = function(){
		return record.lock_expiration;
	}
}

/**
 * @private 
 * @param {JSRecord<db:/svy_security/users>} record
 * @constructor 
 * @properties={typeid:24,uuid:"96BACE39-6564-4270-8DBD-D16E11F0370E"}
 * @AllowToRunInFind
 */
function User(record){
	
	
	/**
	 * Returns the tenant that owns this user
	 * 
	 * @public 
	 * @return {Tenant}
	 */
	this.getTenant = function(){
		return new Tenant(record.users_to_tenants.getSelectedRecord());
	}
	
	/**
	 * Gets this username
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getUserName = function(){
		return record.user_name;
	}
	
	/**
	 * Gets the display name for this user, i.e. "Jane Doe"
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getDisplayName = function(){
		return record.display_name;
	}
	
	/**
	 * Sets the display name of this user
	 * 
	 * @public 
	 * @param {String} displayName
	 * @return {User} This user for call-chaining
	 */
	this.setDisplayName = function(displayName){
		// no change
		if(displayName == record.display_name){
			return this;
		}
		record.display_name = displayName;
		save(record);
		return this;
	}
	
	/**
	 * Checks if the specified password matches this user's hashed password
	 * 
	 * @public 
	 * @param {String} password
	 * @return {Boolean}
	 */
	this.checkPassword = function(password){
		if(!password){
			throw 'Password must be non-null, non-empty string';
		}
		return utils.validatePBKDF2Hash(password,record.user_password);
	}
	
	/**
	 * Sets the users password. 
	 * Specified plain-text password will be hashed and cannot be returned.
	 *
	 * @public 
	 * @param {String} password The plain-text password. 
	 * @return {User} This user for call-chaining
	 */
	this.setPassword = function(password){
		if(!password){
			throw 'Password must be non-null, non-empty string';
		}
		
		// no change
		if(utils.validatePBKDF2Hash(password,record.user_password)){
			return this;
		}
		
		record.user_password = utils.stringPBKDF2Hash(password);
		save(record);
		return this;
	}
	
	/**
	 * Grants the specified role to this user
	 * 
	 * @public 
	 * @param {Role|String} role
	 * @return {User} This user for call-chaining
	 */
	this.addRole = function(role){
		
		if(!role){
			throw 'Role cannot be null';
		}
		/** @type {String} */
		var roleName = role instanceof String ? role : role.getName();
		if(!this.getTenant().getRole(roleName)){
			throw 'Role "'+roleName+'" does not exists in tenant';
		}
		// already has role, no change
		if(this.hasRole(role)){
			return this;
		}
		if(record.users_to_user_roles.newRecord() == -1){
			throw 'failed to create record';
		}
		record.users_to_user_roles.role_name = roleName;
		if(!record.users_to_user_roles.creation_user_name){
			// TODO Logging ?
			record.users_to_user_roles.creation_user_name = SYSTEM_USER;
		}
		save(record.users_to_user_roles);
		return this;
	}
	
	/**
	 * Removes the specified role from this user
	 * 
	 * @public 
	 * @param {Role|String} role
	 * @return {User} This user for call-chaining
	 */
	this.removeRole = function(role){
		if(!role){
			throw 'Role cannot be null';
		}
		var roleName = role instanceof String ? role : role.getName();
		for (var i = 1; i <= record.users_to_user_roles.getSize(); i++) {
			var link = record.users_to_user_roles.getRecord(i);
			if(link.role_name == roleName){
				if(!record.users_to_user_roles.deleteRecord(link)){
					throw 'failed to delete record'
				}
				break;
			}
		}
		return this;
	}
	
	/**
	 * Gets all the roles that are granted to this user
	 *
	 * @public 
	 * @return {Array<Role>}
	 */
	this.getRoles = function(){
		var roles = [];
		for (var i = 1; i <= record.users_to_user_roles.getSize(); i++) {
			var role = record.users_to_user_roles.getRecord(i).user_roles_to_roles.getSelectedRecord();
			roles.push(new Role(role));
		}
		return roles;
	}
	
	/**
	 * Checks if this user is granted the specified role
	 * 
	 * @public 
	 * @param {Role|String} role
	 * @return {Boolean}
	 */
	this.hasRole = function(role){
		if(!role){
			throw 'Role cannot be null';
		}
		var roleName = role instanceof String ? role : role.getName();
		for (var i = 1; i <= record.users_to_user_roles.getSize(); i++) {
			var link = record.users_to_user_roles.getRecord(i);
			if(link.role_name == roleName){
				return true;
			}
		}
		return false;
	}
	
	/**
	 * Gets all the permissions granted to this user via all of their roles
	 * Result will exclude duplicates
	 * 
	 * @public 
	 * @return {Array<Permission>}
	 */
	this.getPermissions = function(){
		// map permisions to reduce recursive iterations 
		var permissions = {};
		var roles = this.getRoles();
		for(var i in roles){
			var rolePermissions = roles[i].getPermissions();
			for(var j in rolePermissions){
				var permission = rolePermissions[j];
				if(!permissions[permission.getName()]){
					permissions[permission.getName()] = permission;
				}
			}
		}
		
		// convert map to array
		var array = [];
		for(var k in permissions){
			array.push(permissions[k]);
		}
		return array;
	}
	
	/**
	 * Checks if the this user is granted the specified permission via their roles 
	 * 
	 * @public 
	 * @param {Permission|String} permission
	 * @return {Boolean}
	 */
	this.hasPermission = function(permission){
		if(!permission){
			throw 'Permission cannot be null';
		}
		var permissionName = permission instanceof String ? permission : permission.getName();
		var permissions = this.getPermissions();
		for(var i in permissions){
			if(permissions[i].getName() == permissionName){
				return true;
			}
		}
		return false;
	}
	
	/**
	 * Gets the number of unique logins this user has from any location at any time
	 * @public 
	 * @return {Number} 
	 */
	this.getSessionCount = function(){
		return databaseManager.getFoundSetCount(record.users_to_sessions);
	}
	
	/**
	 * Gets the active sessions for this user 
	 * This includes any sessions from any device or location
	 * NOTE: Any unterminated sessions are deemed to be active when they not been idle for more than a set timeout period
	 * 
	 * @public 
	 * @return {Array<Session>}
	 */
	this.getActiveSessions = function(){
		var expiration = new Date();
		expiration.setTime(expiration.getTime() - SESSION_TIMEOUT); // i.e 30 min in the past
		var q = record.users_to_sessions.getQuery();
		q.where
			.add(q.columns.session_end.isNull)
			.add(q.columns.last_client_ping.gt(expiration))
		var fs = datasources.db.svy_security.sessions.getFoundSet();
		fs.loadRecords(q);
		var sessions = [];
		for (var i = 1; i <= fs.getSize(); i++) {
			var sesh = fs.getRecord(i);
			sessions.push(new Session(sesh));
		}
		return sessions;
	}
	
	/**
	 * Locks the user account preventing them from logging in
	 * Lock will remain in place until it expires or it is removed using unlock()
	 * Users with active sessions will be unaffected until subsequent login attempts
	 * 
	 * @public 
	 * @param {String} [reason] The reason. Can be a system code, i18n message or plain text
	 * @param {Date} [expiration] The expiration. If no expiration date supplied, locks will persist until unlock() is called.
	 * @return {User}
	 * @see User.unlock
	 */
	this.lock = function(reason, expiration){
		record.lock_flag = 1;
		record.lock_reason = reason;
		record.lock_expiration = expiration;
		save(record);
		return this;
	}
	
	/**
	 * Removes any lock on the user account
	 * 
	 * @public 
	 * @return {User}
	 * @see User.lock
	 */
	this.unlock = function(){
		record.lock_flag = null;
		record.lock_reason = null;
		record.lock_expiration = null;
		save(record);
		return this;
	}
	
	/**
	 * Indicates if this user's account is locked
	 * 
	 * @public 
	 * @return {Boolean}
	 * @see User.lock
	 */
	this.isLocked = function(){
		return record.lock_flag == 1;
	}
	
	/**
	 * Indicates the reason indicated for lock.
	 * 
	 * @public 
	 * @return {String}
	 * @see User.lock
	 */
	this.getLockReason = function(){
		return record.lock_reason;
	}
	
	/**
	 * Indicates when the lock will expire. 
	 * If no expiration is specified, locks will persist until unlock() is called.
	 * 
	 * @public 
	 * @return {Date}
	 */
	this.getLockExpiration = function(){
		return record.lock_expiration;
	}
}

/**
 * @private 
 * @param {JSRecord<db:/svy_security/roles>} record
 * @constructor 
 * 
 * @properties={typeid:24,uuid:"4FB7C5A5-5E35-47EA-9E3A-9FADD537800A"}
 */
function Role(record){
	
		
	/**
	 * Gets the unique display name of this role
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getName = function(){
		return record.role_name;
	}
	
	/**
	 * Sets the display name of this role, must be unique in tenant
	 * 
	 * @public 
	 * @param {String} name
	 * @return {Role} this role for call-chaining
	 */
	this.setName = function(name){
		if(!name){
			throw 'Name cannot be null or empty';
		}
		// no change
		if(name == this.getName()){
			return this;
		}
		if(this.getTenant().getRole(name)){
			throw 'Role name "'+name+'" is not unique';
		}
		record.role_name = name;
		save(record);
		return this;
	}
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getDisplayName = function(){
		return record.display_name;
	}
	
	/**
	 * @public 
	 * @param {String} displayName
	 * @return {Role}
	 */
	this.setDisplayName = function(displayName){
		record.display_name = displayName;
		save(record);
		return this;
	}
	
	/**
	 * Gets the tenant owning this role
	 * 
	 * @public 
	 * @return {Tenant}
	 */
	this.getTenant = function(){
		return new Tenant(record.roles_to_tenants.getSelectedRecord());
	}
	
	
	
	/**
	 * Grants this role to the specified user
	 * 
	 * @public 
	 * @param {User} user
	 * @return {Role} this role for call-chaining
	 */
	this.addUser = function(user){
		
		if(!user){
			throw 'User cannot be null'
		}
		
		/** @type {String} */
		var userName = user instanceof String ? user : user.getUserName();
		if(!this.getTenant().getUser(userName)){
			throw 'User "'+userName+'" does not exist in tenant';
		}
		if(!this.hasUser(user)){
			if(record.roles_to_user_roles.newRecord() == -1){
				throw 'New record failed';
			}
			record.roles_to_user_roles.user_name = userName;
			if(!record.roles_to_user_roles.creation_user_name){
				// TODO logging ?
				record.roles_to_user_roles.creation_user_name = SYSTEM_USER;
			}
			save(record.roles_to_user_roles);
		}
		return this;
	}
	
	/**
	 * Gets all the users to which this role is granted
	 * 
	 * @public 
	 * @return {Array<User>}
	 */
	this.getUsers = function(){
		var users = [];
		for (var i = 1; i <= record.roles_to_user_roles.getSize(); i++) {
			var user = record.roles_to_user_roles.getRecord(i).user_roles_to_users.getSelectedRecord();
			users.push(new User(user));
		}
		return users;
	}
	
	/**
	 * Checks if this role is granted to the specified user
	 * 
	 * @public 
	 * @param {User|String} user
	 * @return {Boolean}
	 */
	this.hasUser = function(user){
		
		if(!user){
			throw 'User cannot be null';
		}
		
		var userName = user instanceof String ? user : user.getUserName();
		for (var i = 1; i <= record.roles_to_user_roles.getSize(); i++) {
			if(record.roles_to_user_roles.getRecord(i).user_name == userName){
				return true;
			}
		}
		return false;
	}
	
	/**
	 * Removes this granted role from the specified user
	 * 
	 * @public 
	 * @param {User|String} user
	 * @return {Role} this role for call-chaining
	 */
	this.removeUser = function(user){
		if(!user){
			throw 'User cannot be null';
		}
		var userName = user instanceof String ? user : user.getUserName();
		for (var i = 1; i <= record.roles_to_user_roles.getSize(); i++) {
			if(record.roles_to_user_roles.getRecord(i).user_name == userName){
				if(!record.roles_to_user_roles.deleteRecord(i)){
					throw 'Failed to delete record';
				}
				break;
			}
		}
		return this;
	}
	
	/**
	 * Grants the specified permission to this role. 
	 * Any users with this role with inherit the permission
	 * 
	 * @public 
	 * @param {Permission|String} permission
	 * @return {Role} this role for call-chaining
	 */
	this.addPermission = function(permission){
		
		if(!permission){
			throw 'Permission cannot be null';
		}
		
		
		/** @type {String} */
		var permissionName = permission instanceof String ? permission : permission.getName();
		if(!scopes.svySecurity.getPermission(permissionName)){
			throw 'Permission "'+permissionName+'" does not exist in system';
		}
		if(!this.hasPermission(permission)){
			if(record.roles_to_roles_permissions.newRecord() == -1){
				throw 'New record failed';
			}
			record.roles_to_roles_permissions.permission_name = permissionName;
			if(!record.roles_to_roles_permissions.creation_user_name){
				// TODO Logging ?
				record.roles_to_roles_permissions.creation_user_name = SYSTEM_USER;
			}
			save(record.roles_to_roles_permissions);
		}
		return this;
	}
	
	/**
	 * Gets all the permissions granted to this role
	 * 
	 * @public 
	 * @return {Array<Permission>}
	 */
	this.getPermissions = function(){

		var permissions = [];
		for (var i = 1; i <= record.roles_to_roles_permissions.getSize(); i++) {
			var permission = record.roles_to_roles_permissions.getRecord(i).roles_permissions_to_permissions.getSelectedRecord();
			permissions.push(new Permission(permission));
		}
		return permissions;
	}
	
	/**
	 * Checks if this role is granted the specified permission
	 * 
	 * @public 
	 * @param {Permission|String} permission
	 * @return {Boolean}
	 */
	this.hasPermission = function(permission){
		if(!permission){
			throw 'Permission cannot be null';
		}
		var permissionName = permission instanceof String ? permission : permission.getName();
		for (var i = 1; i <= record.roles_to_roles_permissions.getSize(); i++) {
			if(record.roles_to_roles_permissions.getRecord(i).permission_name == permissionName){
				return true;
			}
		}
		return false;
	}
	
	/**
	 * Removes the specified permission from this role
	 * 
	 * @public 
	 * @param {Permission|String} permission
	 * @return {Role} this role for call-chaining
	 */
	this.removePermission = function(permission){
		if(!permission){
			throw 'Permission cannot be null';
		}
		var permissionName = permission instanceof String ? permission : permission.getName();
		for (var i = 1; i <= record.roles_to_roles_permissions.getSize(); i++) {
			if(record.roles_to_roles_permissions.getRecord(i).permission_name == permissionName){
				if(!record.roles_to_roles_permissions.deleteRecord(i)){
					throw 'Delete record failed';
				}
				break;
			}
		}
		return this;
	}
}

/**
 * @private 
 * @param {JSRecord<db:/svy_security/permissions>} record 
 * @constructor 
 * @properties={typeid:24,uuid:"71B3A503-60B2-4CEC-B8D5-E8961D6032B1"}
 */
function Permission(record){
	
	
	
	/**
	 * Gets the display name of this permission
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getName = function(){
		return record.permission_name;
	}
	
	/**
	 * Sets the display name of this permission. The name must be unique in system.
	 * 
	 * @public 
	 * @param {String} name Must be non-null and unique
	 * @return {Permission} Returns this permission for call-chaining
	 */
	this.setName = function(name){
		if(!name){
			throw 'Name cannot be null or empty';
		}
		if(getPermission(name)){
			throw 'Permission name "'+name+'" is not unique';
		}
		record.permission_name = name;
		save(record);
		return this;
	}
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getDisplayName = function(){
		return record.display_name;
	}
	
	/**
	 * @public 
	 * @param {String} displayName
	 * @return {Permission}
	 */
	this.setDisplayName = function(displayName){
		record.display_name = displayName;
		save(record);
		return this;
	}
	
	/**
	 * Grants this permission to a new role
	 * 
	 * @public 
	 * @param {Role} role The role to add
	 * @return {Permission} Returns this permission for call-chaining
	 */
	this.addRole = function(role){
		if(!role){
			throw 'Role cannot be null';
		}
		var roleName = role instanceof String ? role : role.getName();
		
		if(!this.hasRole(role)){
			if(record.permissions_to_roles_permissions.newRecord() == -1){
				throw 'New record failed';
			}
			record.permissions_to_roles_permissions.tenant_name = role.getTenant().getName();
			record.permissions_to_roles_permissions.role_name = roleName;
			if(!record.permissions_to_roles_permissions.creation_user_name){
				record.permissions_to_roles_permissions.creation_user_name = SYSTEM_USER;
			}
			save(record)
		}
		return this;
	}
	
	/**
	 * Gets all the roles to which this permission is granted
	 * 
	 * @public 
	 * @return {Array<Role>}
	 */
	this.getRoles = function(){
		var roles = [];
		for (var i = 1; i <= record.permissions_to_roles_permissions.getSize(); i++) {
			var role = record.permissions_to_roles_permissions.getRecord(i).roles_permissions_to_roles.getSelectedRecord();
			roles.push(new Role(role));
		}
		return roles;
	}
	
	/**
	 * Checks if this permission has the specified role
	 * 
	 * @public 
	 * @param {Role|String} role
	 * @return {Boolean}
	 */
	this.hasRole = function(role){
		if(!role){
			throw 'Role cannot be null';
		}
		var roleName = role instanceof String ? role : role.getName();
		for (var i = 1; i <= record.permissions_to_roles_permissions.getSize(); i++) {
			if(record.permissions_to_roles_permissions.getRecord(i).role_name == roleName){
				return true;
			}
		}
		return false;
	}
	
	/**
	 * Removes this granted permission from the specified role
	 * 
	 * @public 
	 * @param {Role|String} role The role to remove
	 * @return {Permission} Returns this permission for call-chaining
	 */
	this.removeRole = function(role){
		if(!role){
			throw 'Role cannot be null';
		}
		var roleName = role instanceof String ? role : role.getName();
		
		for (var i = 1; i <= record.permissions_to_roles_permissions.getSize(); i++) {
			if(record.permissions_to_roles_permissions.getRecord(i).role_name == roleName){
				if(!record.permissions_to_roles_permissions.deleteRecord(i)){
					throw 'Failed to delete record';
				}
				break;
			}
		}
		return this;
	}
	
	/**
	 * @public 
	 * @return {Array<User>}
	 */
	this.getUsers = function(){
		
		var users = [];
		var q = datasources.db.svy_security.users.createSelect();
		var fs = datasources.db.svy_security.users.getFoundSet();
		
		q.result.addPk();
		q.where.add(
			q.joins.users_to_user_roles
			.joins.user_roles_to_roles
			.joins.roles_to_roles_permissions
			.columns.permission_name.eq(record.permission_name)
		);
		
		fs.loadRecords(q);
		for (var i = 1; i <= fs.getSize(); i++) {
			var user = fs.getRecord(i);
			users.push(new User(user));
		}
		return users;
	}
}

/**
 * TODO Tie to servoy session JSClient ID and refactor isXXX methods ?
 * 
 * @private 
 * @param {JSRecord<db:/svy_security/sessions>} record
 * @constructor 
 * @properties={typeid:24,uuid:"6B34CF86-7237-4C7B-87E8-54F30E03C270"}
 */
function Session(record){
	
	/**
	 * Gets the internal ID of this session
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getID = function(){
		return record.id.toString();
	}
	
	/**
	 * Gets the user of this session
	 * Returns null if the user has been deleted. Instead use getUserName
	 * @public 
	 * @return {User}
	 * @see Session.getUserName
	 */
	this.getUser = function(){
		if(!utils.hasRecords(record.sessions_to_users)){
			return null;
		}
		return new User(record.sessions_to_users.getSelectedRecord());
	}
	
	/**
	 * @public 
	 * @return {String} The user name at the time of login
	 */
	this.getUserName = function(){
		return record.user_name;
	}
	
	/**
	 * Gets the tenant for this session
	 * Returns null if the tenant has been deleted. Instead use getTenantName
	 * @public 
	 * @return {Tenant}
	 */
	this.getTenant = function(){
		if(!utils.hasRecords(record.sessions_to_tenants)){
			return null;
		}
		return new Tenant(record.sessions_to_tenants.getSelectedRecord());
	}
	
	/**
	 * @public 
	 * @return {String} The tenant name at the time of login
	 */
	this.getTenantName = function(){
		return record.tenant_name;
	}
	
	/**
	 * Gets the start datetime for this session
	 * 
	 * @public 
	 * @return {Date}
	 */
	this.getStart = function(){
		return record.session_start
	}
	
	/**
	 * Gets the end datetime of this session, null if the session is still active, or not properly terminated.
	 * NOTE: If a session is not properly terminated, one can compare the last clien ping property to the start to determine if the session is abandoned
	 * 
	 * @public 
	 * @return {Date}
	 * 
	 */
	this.getEnd = function(){
		return record.session_end;
	}
	
	/**
	 * Gets the most recent time of known session activity.
	 * NOTE: If a session is not properly terminated, one can compare the last client ping property to the start to determine if the session is abandoned
	 * 
	 * @public 
	 * @return {Date}
	 * 
	 */
	this.getLastActivity = function(){
		return record.last_client_ping;
	}
	
	/**
	 * Gets the client IP address of the session
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getIPAddress = function(){
		return record.ip_address;
	}
	
	/**
	 * Gets the user agent string of the client session.
	 * The string will be null if the session was not browser-based
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getUserAgentString = function(){
		return record.user_agent_string;
	}
	
	/**
	 * Indicates if this sesssion is still active
	 * 
	 * @public 
	 * @return {Boolean} True if the session has not terminated and has not been inactive for longer than the timeout period 
	 */
	this.isActive = function(){
		if(record.session_end){
			return false;
		}
		return record.last_client_ping.getTime() + SESSION_TIMEOUT > new Date().getTime();
		
	}
	
	/**
	 * Indicates if this session was terminated 
	 * @public 
	 * @return {Boolean} True when session was terminated normally or by timeout from inactivity 
	 */
	this.isTerminated = function(){
		return record.session_end != null || this.isAbandoned();
	}
	
	/**
	 * Indicates if this session was abandoned
	 *  
	 * @public 
	 * @return {Boolean} True if this session was not terminated normally, but has timed out
	 */
	this.isAbandoned = function(){
		return record.session_end == null && !this.isActive();
	}
	
	/**
	 * Records a client ping in the database. Internal user only.
	 * 
	 * @protected  
	 * NOTE: This should only be called within this scope
	 */
	this.sendPing = function(){
		record.last_client_ping = new Date();
		save(record);
	}
}
/**
 * Utility to save record with error thrown
 * @private 
 * @param {JSRecord|JSFoundset} record
 *
 * @properties={typeid:24,uuid:"A2BD1ED2-F372-477C-BFF5-0CED1A69BDD9"}
 */
function save(record){
	if(!databaseManager.saveData(record)){
		throw 'Failed to save record';
	}
}

/**
 * Utility to sync permission records to the internal, design-time  Servoy Security Groups.
 * This should be called on solution import or on startup
 * This action will create new permission records.
 * 
 * NOTE: This action will not delete permissions which have been removed from internal security.
 * Design-time groups should never be renamed. They will be seen only as an ADD and will lose their tie to roles.
 * 
 * @private 
 * @properties={typeid:24,uuid:"EA173150-F833-4823-9110-5C576FFE362E"}
 */
function syncPermissions(){
	var permissionFS = datasources.db.svy_security.permissions.getFoundSet();
	var groups = security.getGroups().getColumnAsArray(2);
	for(var i in groups){
		if(!getPermission(groups[i])){
			if(permissionFS.newRecord() == -1){
				throw 'New Record Failed';
			}
			permissionFS.permission_name = groups[i];
			if(!permissionFS.creation_user_name){
				permissionFS.creation_user_name = SYSTEM_USER;
			}
			save(permissionFS);
			
			// TODO proper logging
			application.output('Created permission "'+groups[i]+'" which did not exist',LOGGINGLEVEL.DEBUG); // TODO proper logging
		}
	}
	
	// look for removed permissions
	permissionFS.loadAllRecords();
	for (i = 1; i <= permissionFS.getSize(); i++) {
		var record = permissionFS.getRecord(i);
		if(groups.indexOf(record.permission_name) == -1){
			application.output('Permission "'+record.permission_name+'" is no longer found within internal security settings', LOGGINGLEVEL.WARNING); // TODO proper logging
		}
	}
}

/**
 * @private
 * @param {User} user
 *  
 * @properties={typeid:24,uuid:"85255CC3-38DC-4F97-923C-CD1BB1BD31A8"}
 */
function initSession(user){
	
	if(!user) throw 'No user';
	if(getSession()) throw 'Session "'+getSession().getID()+'" already in progress in this client';
	
	// create session
	var fs = datasources.db.svy_security.sessions.getFoundSet();
	fs.newRecord();
	fs.user_name = user.getUserName();
	fs.tenant_name = user.getTenant().getName();
	fs.ip_address = application.getIPAddress();
	fs.last_client_ping = new Date();
	if(application.getApplicationType() == APPLICATION_TYPES.NG_CLIENT){
		fs.user_agent_string = plugins.ngclientutils.getUserAgent();
	}
	save(fs);
	
	// create ping job
	var jobName = 'com.servoy.extensions.security.sessionUpdater';
	plugins.scheduler.removeJob(jobName);
	plugins.scheduler.addJob(jobName,new Date(),sessionClientPing,SESSION_PING_INTERVAL);
	
	// store session id
	activeUserName = user.getUserName();
	activeTenantName = user.getTenant().getName();
	sessionID = fs.id.toString();

}

/**
 * Sends the current session going to DB. For internal use only with initSession() which schedules it
 * 
 * @private 
 * @properties={typeid:24,uuid:"92DCCEDD-F678-4E72-89A3-BEEE78E88958"}
 */
function sessionClientPing(){
	if(!utils.hasRecords(active_session)) return;
	active_session.last_client_ping = new Date();
	save(active_session);
}

/**
 * @private 
 * @properties={typeid:24,uuid:"A9B894CA-526A-42AB-ABED-31F414D25EC8"}
 */
function closeSession(){
	if(!utils.hasRecords(active_session)) return;
	active_session.session_end = new Date();
	save(active_session);
	sessionID = null;
}

/**
 * @private 
 * @properties={typeid:24,uuid:"B9830A16-34D1-4844-937F-B873663F98F1"}
 */
function filterSecurityTables(){
	var filterName = 'com.servoy.extensions.security.data-filter';
	var serverName = datasources.db.svy_security.getServerName();
	databaseManager.removeTableFilterParam(serverName,filterName);
	if(!databaseManager.addTableFilterParam(serverName,null,'tenant_name','=',activeTenantName,filterName)){
		logout();
		throw 'Failed to filter security tables';	
	}
}
/**
 * Check for user name bypassing any filters for current tenant
 * @private 
 * @param {Object} userName
 * @return {Boolean} True if user is found in system
 *
 * @properties={typeid:24,uuid:"1FA4E812-55A3-4B03-9EF9-D155FFA89BD4"}
 */
function userNameExists(userName){
	var q = datasources.db.svy_security.users.createSelect();
	q.result.addPk();
	q.where.add(q.columns.user_name.eq(userName))
	var ds = databaseManager.getDataSetByQuery(q,false,1);
	if(ds.getException()){
		throw 'SQL error checking for existing user'; 
	}
	return ds.getMaxRowIndex() > 0;
}

/**
 * Initializes the module.
 * NOTE: This var must remain at the BOTTOM of the file.
 * @private 
 * @SuppressWarnings (unused)
 * @properties={typeid:35,uuid:"9C3DE1BE-A17E-4380-AB9F-09500C26514F",variableType:-4}
 */
var init = function(){
	syncPermissions();
}();