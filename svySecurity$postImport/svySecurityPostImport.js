/**
 * @type {String}
 * @private 
 *
 * @properties={typeid:35,uuid:"BB5D49C1-191E-4073-B4DC-D619F08509ED"}
 */
var ROLES_FILE_NAME = 'data_roles.txt';

/**
 * @type {String}
 * @private 
 *
 * @properties={typeid:35,uuid:"159E899F-CFFF-4F90-9414-992316637DF2"}
 */
var ROLES_PERMISSIONS_FILE_NAME = 'data_roles_permissions.txt';

/**
 * Callback method for when solution is opened.
 * When deeplinking into solutions, the argument part of the deeplink url will be passed in as the first argument
 * All query parameters + the argument of the deeplink url will be passed in as the second argument
 * For more information on deeplinking, see the chapters on the different Clients in the Deployment Guide.
 *
 * @param {String} arg startup argument part of the deeplink url with which the Client was started
 * @param {Object<Array<String>>} queryParams all query parameters of the deeplink url with which the Client was started
 *
 * @properties={typeid:24,uuid:"CF946393-5A9C-471D-AA27-9B3DF6CA7E17"}
 */
function onSecurityPostImportHookOpen(arg, queryParams) {
	updateEmptyUserTenantUUID();
	syncPermissions();
}

/**
 * @properties={typeid:24,uuid:"4459EE6E-13F4-4BC3-87BC-8C131D2F10F4"}
 */
function updateEmptyUserTenantUUID() {
    var fsUser = datasources.db.svy_security.users.getFoundSet();
    var qryUser = datasources.db.svy_security.users.createSelect();
    qryUser.where.add(qryUser.columns.user_uuid.isNull);
    fsUser.loadRecords(qryUser);
    
    if(fsUser.getSize() > 0) {
    	fsUser.forEach(/** @param {JSRecord<db:/svy_security/users>} record */function(record) {
    		if(!record.user_uuid) {
    			record.user_uuid = application.getUUID();
    		}
    	})
		databaseManager.saveData(fsUser);
    }

    var fsTenant = datasources.db.svy_security.tenants.getFoundSet();
    var qryTenant = datasources.db.svy_security.tenants.createSelect();
    qryTenant.where.add(qryTenant.columns.tenant_uuid.isNull);
    fsTenant.loadRecords(qryTenant);
    
    if(fsTenant.getSize() > 0) {
    	fsTenant.forEach(/** @param {JSRecord<db:/svy_security/tenants>} record */function(record) {
    		if(!record.tenant_uuid) {
    			record.tenant_uuid = application.getUUID();
    		}
    	})
		databaseManager.saveData(fsTenant);
    }
}

/**
 * Returns the path to the workspace
 * @private
 * 
 * @return {String}
 * 
 * @properties={typeid:24,uuid:"DABC4088-5986-499E-8B11-3700E4BC5239"}
 */
function getWorkspacePath() {
	var workspacePath = java.lang.System.getProperty("osgi.instance.area");
	if (scopes.svySystem.isWindowsPlatform()) {
		return workspacePath.substr(6, workspacePath.length);
	} else {
		return workspacePath.substr(5, workspacePath.length);
	}
}

/**
 * Stores all roles and their permissions of all master tenants to the media of this solution.
 * In a postImport hook you ship with your solution, call deployMasterTenantRolesAndPermissions() to deploy the data
 * 
 * @public 
 * @properties={typeid:24,uuid:"62ADD463-2510-47CA-977C-C6C577633F01"}
 */
function saveRolesAndPermissions() {
	var workspacePath = getWorkspacePath();
	var rolesFilePath = workspacePath + scopes.svyIO.getFileSeperator() + 'svySecurity$postImport' + scopes.svyIO.getFileSeperator() + 'medias' + scopes.svyIO.getFileSeperator() + ROLES_FILE_NAME;
	var rolesPermissionsFilePath = workspacePath + scopes.svyIO.getFileSeperator() + 'svySecurity$postImport' + scopes.svyIO.getFileSeperator() + 'medias' + scopes.svyIO.getFileSeperator() + ROLES_PERMISSIONS_FILE_NAME;
	
	var qMasterTenants = datasources.db.svy_security.tenants.createSelect();
	qMasterTenants.result.add(qMasterTenants.columns.master_tenant_name).distinct;
	
	//load all roles of all master tenants and dump them in text file
	var qRoles = datasources.db.svy_security.roles.createSelect();
	var dataProviderIds = datasources.db.svy_security.roles.getColumnNames();
	for (var d = 0; d < dataProviderIds.length; d++) {
		qRoles.result.add(qRoles.getColumn(dataProviderIds[d]));
	}
	
	qRoles.where.add(qRoles.columns.tenant_name.isin(qMasterTenants));
	qRoles.sort.add(qRoles.columns.tenant_name.asc);
	
	var dsRoles = databaseManager.getDataSetByQuery(qRoles, -1);
	
	var exportFile = plugins.file.convertToJSFile(rolesFilePath);
	exportFile.getParentFile().mkdirs();
	
	/**@param {String} value */
	function formatValue(value) {
		var result = value;
		if (value == null) {
			result = '(null)';
		} else if (value && (typeof value) == 'string' && value.match('\n')) {
			result = value.replace(/\n/, '\n')
		} else if (value && value instanceof Date) {
			dateValue = value;
			result = utils.dateFormat(dateValue, 'yyyyMMddHHmmssS');
		}
		return result;
	}
	
	var dataToWrite = [],
		/** @type {Date} */
		dateValue;
		
	dataToWrite.push(dsRoles.getColumnNames().join(';$;'));
	for (var i = 1; i <= dsRoles.getMaxRowIndex(); i++) {
		var dataRow = dsRoles.getRowAsArray(i);
		dataRow = dataRow.map(formatValue);
		dataToWrite.push(dataRow.join(';$;'));
	}
	
	plugins.file.writeTXTFile(exportFile, dataToWrite.join('\n'), 'UTF-8');
	application.output(dsRoles.getMaxRowIndex() + ' roles successfully saved to file ' + exportFile.getName() + ' in solution svySecurity$postImport');
	
	//load all roles_permissions of all master tenants and dump them in text file
	var qRolesPermissions = datasources.db.svy_security.roles_permissions.createSelect();
	dataProviderIds = datasources.db.svy_security.roles_permissions.getColumnNames();
	for (d = 0; d < dataProviderIds.length; d++) {
		qRolesPermissions.result.add(qRolesPermissions.getColumn(dataProviderIds[d]));
	}
	
	qRolesPermissions.where.add(qRolesPermissions.columns.tenant_name.isin(qMasterTenants));
	qRolesPermissions.sort.add(qRolesPermissions.columns.tenant_name.asc).add(qRolesPermissions.columns.role_name);
	
	var dsRolesPermissions = databaseManager.getDataSetByQuery(qRolesPermissions, -1);
	
	exportFile = plugins.file.convertToJSFile(rolesPermissionsFilePath);
	exportFile.getParentFile().mkdirs();
	
	dataToWrite = [];
	dataToWrite.push(dsRolesPermissions.getColumnNames().join(';$;'));
	for (i = 1; i <= dsRolesPermissions.getMaxRowIndex(); i++) {
		dataRow = dsRolesPermissions.getRowAsArray(i);
		dataRow = dataRow.map(formatValue);
		dataToWrite.push(dataRow.join(';$;'));
	}
	
	plugins.file.writeTXTFile(exportFile, dataToWrite.join('\n'), 'UTF-8');
	application.output(dsRolesPermissions.getMaxRowIndex() + ' roles_permissions successfully saved to file ' + exportFile.getName() + ' in solution svySecurity$postImport');
}

/**
 * Utility to sync permission records to the internal, design-time Servoy Security Groups.
 * 
 * @public 
 * @properties={typeid:24,uuid:"C08C2113-3A07-4691-9D29-F293B6D32B4F"}
 */
function syncPermissions() {
	scopes.svySecurity.syncPermissions();
}

/**
 * Deploys the data of master tenants stored via saveRolesAndPermissions().
 * This should be called from a postImport hook
 * 
 * @public 
 * 
 * @properties={typeid:24,uuid:"C281E834-4389-4B7D-B25F-2211D9470938"}
 * @AllowToRunInFind
 */
function deployMasterTenantRolesAndPermissions() {
	var rolesData = new java.lang.String(plugins.http.getMediaData('media:///' + ROLES_FILE_NAME), 'UTF-8');
	
	var dataRows,
		/** @type {Array<String>} */ 	
		dataRow,
		columnNames,
		/** @type {Array<Number>} */ 	
		columnTypes,
		tenantColumn,
		c,
		d,
		jsColumn,
		/** @type {scopes.svySecurity.Tenant} */ 
		tenant,
		/** @type {scopes.svySecurity.Role} */
		role;
	
	/**
	 * @param {String} input
	 * @param {Number} type
	 * @return {Object}
	 */
	function getValue(input, type) {
		var result = input;
		if (input === '(null)') {
			return null;
		}
		if (type === JSColumn.DATETIME) {
			result = utils.parseDate(input, 'yyyyMMddHHmmssS');
		} else if (input && type === JSColumn.TEXT) {
			result = utils.stringReplace(input, '\\n', '\n');						
		} 
		return result;
	}
	
	var	currentTenantRoles,
		tenantRoles,
		rolesFs = datasources.db.svy_security.roles.getFoundSet(),
		rolesTable = datasources.db.svy_security.roles.getTable(),
		recordRoles,
		roleColumn;
	
	function removeRoles() {
		/** @type {Array<String>} */
		var removedRoles = scopes.svyJSUtils.arrayDiff(currentTenantRoles, tenantRoles);
		for (var r = 0; r < removedRoles.length; r++) {
			tenant.deleteRole(removedRoles[r]);
		}
	}
	
	if (rolesData) {
		dataRows = rolesData.split('\n');
		if (dataRows.length > 0) {
			columnNames = dataRows[0].split(';$;');
			columnTypes = [];
			for (c = 0; c < columnNames.length; c++) {
				jsColumn = rolesTable.getColumn(columnNames[c]);
				columnTypes.push(jsColumn.getType());
			}
			
			tenantColumn = columnNames.indexOf('tenant_name');
			roleColumn = columnNames.indexOf('role_name');
			dataRows.shift();
			
			for (d = 0; d < dataRows.length; d++) {
				dataRow = dataRows[d].split(';$;');
				if (!tenant || tenant.getName() !== dataRow[tenantColumn]) {
					if (tenant) {
						//tenant changed; process roles that might have been removed
						removeRoles();
					}
					
					//tenant changed
					tenant = scopes.svySecurity.getTenant(dataRow[tenantColumn]);
					if (!tenant) {
						application.output('Role data of tenant ' + dataRows[tenantColumn] + ' cannot be processed, because the tenant cannot be found.', LOGGINGLEVEL.WARNING);
						continue;
					}
					//roles that were shipped with the data
					tenantRoles = [];
					//roles the tenant currently has
					currentTenantRoles = tenant.getRoles().map(
						/** @param {scopes.svySecurity.Role} item */
						function getNames(item) {
							return item.getName();
						}
					);
				}
				
				tenantRoles.push(dataRow[roleColumn]);
				
				if (rolesFs.find()) {
					rolesFs.tenant_name = tenant.getName();
					rolesFs.role_name = dataRow[roleColumn];
					rolesFs.search();
					
					if (utils.hasRecords(rolesFs)) {
						recordRoles = rolesFs.getRecord(1);
					} else {
						recordRoles = rolesFs.getRecord(rolesFs.newRecord());
					}
					
					for (var x = 0; x < dataRow.length; x++) {
						recordRoles[columnNames[x]] = getValue(dataRow[x], columnTypes[x]);
					}
					
					databaseManager.saveData(recordRoles);
				}
			}
			
			removeRoles();
		}
	}
	
	var rolesPermissionsData = new java.lang.String(plugins.http.getMediaData('media:///' + ROLES_PERMISSIONS_FILE_NAME), 'UTF-8');
	
	var	currentRolePermissions,
		tenantRolePermissions,
		rolePermissionFs = datasources.db.svy_security.roles_permissions.getFoundSet(),
		rolePermissionsTable = datasources.db.svy_security.roles_permissions.getTable(),
		recordRolePermissions,
		permissionColumn;
	
	function removePermissions() {
		/** @type {Array<String>} */
		var removedPermissions = scopes.svyJSUtils.arrayDiff(currentRolePermissions, tenantRolePermissions);
		for (var r = 0; r < removedPermissions.length; r++) {
			role.removePermission(removedPermissions[r]);
		}
	}
	
	if (rolesPermissionsData) {
		dataRows = rolesPermissionsData.split('\n');
		if (dataRows.length > 0) {
			columnNames = dataRows[0].split(';$;');
			columnTypes = [];
			for (c = 0; c < columnNames.length; c++) {
				jsColumn = rolePermissionsTable.getColumn(columnNames[c]);
				columnTypes.push(jsColumn.getType());
			}
			
			tenantColumn = columnNames.indexOf('tenant_name');
			roleColumn = columnNames.indexOf('role_name');
			permissionColumn = columnNames.indexOf('permission_name');
			dataRows.shift();
			
			for (d = 0; d < dataRows.length; d++) {
				dataRow = dataRows[d].split(';$;');
				if (!tenant || tenant.getName() !== dataRow[tenantColumn] || !role || role.getName() !== dataRow[roleColumn]) {
					if (role) {
						//role changed; process permissions that might have been removed
						removePermissions();
					}
					
					//tenant changed
					if (!tenant || tenant.getName() !== dataRow[tenantColumn]) {
						tenant = scopes.svySecurity.getTenant(dataRow[tenantColumn]);
					}
					if (!tenant) {
						application.output('Permission data of tenant ' + dataRows[tenantColumn] + ' cannot be processed, because the tenant cannot be found.', LOGGINGLEVEL.WARNING);
						continue;
					}
					if (!role || role.getName() !== dataRow[roleColumn]) {
						//role changed
						role = tenant.getRole(dataRow[roleColumn])
					}
					if (!role) {
						application.output('Permission data of role ' + dataRows[roleColumn] + ' of tenant ' + dataRows[tenantColumn] + ' cannot be processed, because the role cannot be found.', LOGGINGLEVEL.WARNING);
						continue;
					}
					//roles that were shipped with the data
					tenantRolePermissions = [];
					//roles the tenant currently has
					currentRolePermissions = role.getPermissions().map(
						/** @param {scopes.svySecurity.Permission} item */
						function getNames(item) {
							return item.getName();
						}
					);
				}
				
				tenantRolePermissions.push(dataRow[permissionColumn]);
				
				if (rolePermissionFs.find()) {
					rolePermissionFs.tenant_name = tenant.getName();
					rolePermissionFs.role_name = dataRow[roleColumn];
					rolePermissionFs.permission_name = dataRow[permissionColumn];
					rolePermissionFs.search();
					
					if (utils.hasRecords(rolePermissionFs)) {
						recordRolePermissions = rolePermissionFs.getRecord(1);
					} else {
						recordRolePermissions = rolePermissionFs.getRecord(rolePermissionFs.newRecord());
					}
					
					for (var y = 0; y < dataRow.length; y++) {
						recordRolePermissions[columnNames[y]] = getValue(dataRow[y], columnTypes[y]);
					}
					
					databaseManager.saveData(recordRolePermissions);
				}
			}
			
			removePermissions();
		}
	}
}