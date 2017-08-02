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
var tenantID = null;

/**
 * @protected 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"A6511E73-F3FD-4A19-97F3-D9B55493F853"}
 */
var userID = null;

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
	syncPermissions();
	
	// get internal groups
	var servoyGroups = [];
	var permissions = user.getPermissions();
	for(var i in permissions){
		servoyGroups.push(permissions[i].getInternalName())
	}
	
	// no groups
	if(!servoyGroups.length){
		application.output('No Groups. Cannot login', LOGGINGLEVEL.WARNING);
		return false;
	}
	
	// create session
	initSession(user);
	
	// filter security tables
	filterSecurityTables();
	
	// login
	if(!security.login(user.getUserName(),user.getID(),servoyGroups)){
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
			throw 'Calling getUser w/ no tenant supplied and no active tenant. Results may not be unique.';
		}
	}
	
	// get matching user
	var fs = datasources.db.svy_security.users.getFoundSet();
	fs.find();
	fs.user_name = userName;
	fs.users_to_tenants.tenant_name = tenantName;
	var results = fs.search()  
	if(results == 1){
		return new User(fs.getSelectedRecord());
	}
	
	// No Match
	// TODO logging
	return null;
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
 */
function Tenant(record){
	
	/**
	 * Returns the internal unique id of this tenant
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getID = function(){
		return record.id.toString()
	}
	
	/**
	 * Creates a user with the specified user name
	 * 
	 * @public 
	 * @param {String} userName Must be unique in tenant
	 * @param {String} [password] Create user with password
	 * @return {User}
	 * @throws {String} If the user name is not unique
	 * @see User.setPassword
	 */
	this.createUser = function(userName, password){
		if(!userName){
			throw 'User name cannot be null or empty';
		}
		if(this.getUser(userName)){
			throw 'User Name "'+userName+'"is not unique in tenant';
		}
		if(record.tenants_to_users.newRecord() == -1){
			throw 'Failed to create record';
		}
		
		record.tenants_to_users.user_name = userName;
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
	 * Gets the name of this tenant which is unique in system
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getName = function(){
		return record.tenant_name;
	}
	
	/**
	 * Sets the name of the tenant. Must be unique in system
	 * @public 
	 * @param {String} name
	 * @return {Tenant} Returns this tenant for call chaining
	 */
	this.setName = function(name){
		if(!name){
			throw 'Tenant name cannot be null or empty';
		}
		if(name == record.tenant_name){
			// Log no change?
			return this;
		}
		if(getTenant(name)){
			throw 'Tenant name "'+name+'" is not unique in system';
		}
		record.tenant_name = name;
		save(record);
		return this;
	}
	
	/**
	 * Gets the description of this tenant
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getDescription = function(){
		return record.tenant_description;
	}
	
	/**
	 * @public 
	 * @param {String} description
	 * @return {Tenant} Returns this tenant for call chaining
	 */
	this.setDescription = function(description){
		record.tenant_description = description;
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
	 * Returns the internal unique id of this user
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getID = function(){
		return record.id.toString()
	}
	
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
	 * Sets this user's username. Must be non-null and unique in tenant
	 * 
	 * @public 
	 * @param {String} userName
	 * @return {User} This user for call-chaining
	 */
	this.setUserName = function(userName){
		if(!userName){
			throw 'User name must be non-null non-empty string'
		}
		if(record.user_name == userName){
			// log no change ?
			return this;
		}
		if(this.getTenant().getUser(userName)){
			throw 'UserName "'+userName+'" is not unique in tenant';
		}
		record.user_name = userName;
		save(record);
		return this;
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
	 * @param {Role} role
	 * @return {User} This user for call-chaining
	 */
	this.addRole = function(role){
		if(!role){
			throw 'Role cannot be null';
		}
		// already has role, no change
		if(this.hasRole(role)){
			return this;
		}
		if(record.users_to_user_roles.newRecord() == -1){
			throw 'failed to create record';
		}
		record.users_to_user_roles.role_id = role.getID();
		save(record.users_to_user_roles);
		return this;
	}
	
	/**
	 * Removes the specified role from this user
	 * 
	 * @public 
	 * @param {Role} role
	 * @return {User} This user for call-chaining
	 */
	this.removeRole = function(role){
		if(!role){
			throw 'Role cannot be null';
		}
		for (var i = 1; i <= record.users_to_user_roles.getSize(); i++) {
			var link = record.users_to_user_roles.getRecord(i);
			if(link.role_id == role.getID()){
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
	 * @param {Role} role
	 * @return {Boolean}
	 */
	this.hasRole = function(role){
		for (var i = 1; i <= record.users_to_user_roles.getSize(); i++) {
			var link = record.users_to_user_roles.getRecord(i);
			if(link.role_id == role.getID()){
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
	 * @param {Permission} permission
	 * @return {Boolean}
	 */
	this.hasPermission = function(permission){
		var permissions = this.getPermissions();
		for(var i in permissions){
			if(permissions[i].getID() == permission.getID()){
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
	 * Returns the internal unique id of this Role
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getID = function(){
		return record.id.toString()
	}
	
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
	 * Gets the description of this role
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getDescription = function(){
		return record.role_description;
	}
	
	/**
	 * Sets the description of this role
	 * 
	 * @public 
	 * @param {String} description
	 * @return {Role} this role for call-chaining
	 */
	this.setDescription = function(description){
		if(record.role_description != description){
			record.role_description = description;
			save(record);
		}
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
		if(!this.hasUser(user)){
			if(record.roles_to_user_roles.newRecord() == -1){
				throw 'New record failed';
			}
			record.roles_to_user_roles.user_id = user.getID();
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
	 * @param {User} user
	 * @return {Boolean}
	 */
	this.hasUser = function(user){
		if(!user){
			throw 'User cannot be null';
		}
		for (var i = 1; i <= record.roles_to_user_roles.getSize(); i++) {
			if(record.roles_to_user_roles.getRecord(i).user_id == user.getID()){
				return true;
			}
		}
		return false;
	}
	
	/**
	 * Removes this granted role from the specified user
	 * 
	 * @public 
	 * @param {User} user
	 * @return {Role} this role for call-chaining
	 */
	this.removeUser = function(user){
		if(!user){
			throw 'User cannot be null';
		}
		for (var i = 1; i <= record.roles_to_user_roles.getSize(); i++) {
			if(record.roles_to_user_roles.getRecord(i).user_id == user.getID()){
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
	 * @param {Permission} permission
	 * @return {Role} this role for call-chaining
	 */
	this.addPermission = function(permission){
		if(!permission){
			throw 'Permission cannot be null';
		}
		// already has it
		if(!this.hasPermission(permission)){
			if(record.roles_to_roles_permissions.newRecord() == -1){
				throw 'New record failed';
			}
			record.roles_to_roles_permissions.permission_id = permission.getID();
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
	 * @param {Permission} permission
	 * @return {Boolean}
	 */
	this.hasPermission = function(permission){
		if(!permission){
			throw 'Permission cannot be null';
		}
		for (var i = 1; i <= record.roles_to_roles_permissions.getSize(); i++) {
			if(record.roles_to_roles_permissions.getRecord(i).permission_id == permission.getID()){
				return true;
			}
		}
		return false;
	}
	
	/**
	 * Removes the specified permission from this role
	 * 
	 * @public 
	 * @param {Permission} permission
	 * @return {Role} this role for call-chaining
	 */
	this.removePermission = function(permission){
		if(!permission){
			throw 'Permission cannot be null';
		}
		for (var i = 1; i <= record.roles_to_roles_permissions.getSize(); i++) {
			if(record.roles_to_roles_permissions.getRecord(i).permission_id == permission.getID()){
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
	 * Returns the internal unique id of this Role
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getID = function(){
		return record.id.toString()
	}
	
	/**
	 * Gets the internal name of this permission
	 * This is for internal use only, to link this permission to Servoy's security engine 
	 * @public  
	 * @return {String}
	 */
	this.getInternalName = function(){
		return record.internal_name;
	}
	
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
	 * Gets the display description for this permission
	 * 
	 * @public 
	 * @return {String}
	 */
	this.getDescription = function(){
		return record.permission_description;
	}
	
	/**
	 * Sets the description of this permission
	 * 
	 * @public 
	 * @param {String} description
	 * @return {Permission} Returns this permission for call-chaining
	 */
	this.setDescription = function(description){
		if(description != record.permission_description){
			record.permission_description = description;
			save(record);
		}
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
		if(!this.hasRole(role)){
			if(record.permissions_to_roles_permissions.newRecord() == -1){
				throw 'New record failed';
			}
			record.permissions_to_roles_permissions.tenant_id = role.getTenant().getID();
			record.permissions_to_roles_permissions.role_id = role.getID();
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
	 * @param {Role} role
	 * @return {Boolean}
	 */
	this.hasRole = function(role){
		if(!role){
			throw 'Role cannot be null';
		}
		for (var i = 1; i <= record.permissions_to_roles_permissions.getSize(); i++) {
			if(record.permissions_to_roles_permissions.getRecord(i).role_id == role.getID()){
				return true;
			}
		}
		return false;
	}
	
	/**
	 * Removes this granted permission from the specified role
	 * 
	 * @public 
	 * @param {Role} role The role to remove
	 * @return {Permission} Returns this permission for call-chaining
	 */
	this.removeRole = function(role){
		if(!role){
			throw 'Role cannot be null';
		}
		for (var i = 1; i <= record.permissions_to_roles_permissions.getSize(); i++) {
			if(record.permissions_to_roles_permissions.getRecord(i).role_id == role.getID()){
				if(!record.permissions_to_roles_permissions.deleteRecord(i)){
					throw 'Failed to delete record';
				}
				break;
			}
		}
		return this;
	}
}

/**
 * TODO Tie to servoy session JSClient ID and refactor isXXX methods
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
	 * 
	 * @public 
	 * @return {User}
	 */
	this.getUser = function(){
		return new User(record.sessions_to_users.getSelectedRecord());
	}
	
	/**
	 * Gets the tenant for this session
	 * 
	 * @public 
	 * @return {Tenant}
	 */
	this.getTenant = function(){
		return new Tenant(record.sessions_to_tenants.getSelectedRecord());
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
			permissionFS.internal_name = groups[i];
			permissionFS.permission_name = groups[i];
			save(permissionFS);
			
			// TODO proper logging
			application.output('Created permission "'+groups[i]+'" which did not exist',LOGGINGLEVEL.DEBUG); // TODO proper logging
		}
	}
	
	// look for removed permissions
	permissionFS.loadAllRecords();
	for (i = 1; i <= permissionFS.getSize(); i++) {
		var record = permissionFS.getRecord(i);
		if(groups.indexOf(record.internal_name) == -1){
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
	fs.user_id = user.getID();
	fs.tenant_id = user.getTenant().getID();
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
	userID = user.getID();
	tenantID = user.getTenant().getID();
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
	if(
		!databaseManager.addTableFilterParam(serverName,null,'tenant_id','=',tenantID,filterName) ||
		!databaseManager.addTableFilterParam(datasources.db.svy_security.tenants.getDataSource(),'id','=',tenantID,filterName)){
			
		throw 'Failed to filter security tables';	
	}
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