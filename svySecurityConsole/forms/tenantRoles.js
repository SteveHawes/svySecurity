/**
 * @protected  
 * @type {String}
 *
 * @properties={typeid:35,uuid:"A9483D94-2F16-4BC5-93C3-A9E5A026EFBB"}
 */
var m_SelectedRoleUserMember = '';

/**
 * @protected 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"E3DFB167-DA6E-49DA-911C-D128EDDBBAB5"}
 */
var m_SelectedRolePermission = '';

/**
 * @public 
 * @param {JSFoundSet<db:/svy_security/tenants>} fs
 *
 * @properties={typeid:24,uuid:"A74AA243-7A3A-4049-A860-90D80DD9885C"}
 */
function show(fs){
    controller.loadRecords(fs);
    if (databaseManager.hasRecords(foundset) && databaseManager.hasRecords(foundset.svy_sec_console_tenants_to_roles)) {
        scopes.svySecurityConsole.svySecConsole_TenantRoleFilter = foundset.svy_sec_console_tenants_to_roles.getRecord(1).role_name;        
    }
    else {
        scopes.svySecurityConsole.svySecConsole_TenantRoleFilter = null;
    }
    application.getWindow().show(this);
}


/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"F93341EC-646C-4141-A72C-98A4D98EE72D"}
 */
function onActionShowTenant(event) {
    forms.tenantDetail.show(tenant_name);
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"F1A6E2C4-5F11-4AB0-A2C6-DD284AA58189"}
 */
function onShow(firstShow, event) {
    if (tenant_name) {
        setHeaderText(utils.stringFormat('Roles For Tenant [%1$s]', [tenant_name]));
    } else {
        setHeaderText('No Tenant To Display');
    }
}

/**
 * Handle changed data, return false if the value should not be accepted. In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip.
 *
 * @param {String} oldValue old value
 * @param {String} newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"F5559F8E-503B-4C9F-A9F1-8366EAEB3399"}
 */
function onDataChangeSelectedRole(oldValue, newValue, event) {
    m_SelectedRolePermission = null;
    m_SelectedRoleUserMember = null;
    return true;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"6D7007AE-C26F-4B08-A02D-118CCAB4272F"}
 */
function onActionCreateRole(event) {
    if (!tenant_name) {
        return;
    }
    var newRoleName = plugins.dialogs.showInputDialog('Create New Role','Enter name for the new role:');
    if (!newRoleName) {
        return;
    }
    var tenant = scopes.svySecurity.getTenant(tenant_name);
    if (!tenant) {
        plugins.dialogs.showErrorDialog('Error', utils.stringFormat('Cannot find tenant [%1$s].', [tenant_name]));
        return;
    }
    tenant.createRole(newRoleName);
    scopes.svySecurityConsole.svySecConsole_TenantRoleFilter = newRoleName;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"F1B18E9E-4C67-40DF-AB67-45355EBE7B26"}
 */
function onActionDeleteRole(event) {
    if (!tenant_name) {
        return;
    }
    
    if (!scopes.svySecurityConsole.svySecConsole_TenantRoleFilter) {
        plugins.dialogs.showInfoDialog('Selection Required','Please, select a role first.');
        return;
    }
    
    var response = plugins.dialogs.showWarningDialog('Confirm Delete','Do you want to delete the selected role?', 'No', 'Yes');
    if (response != 'Yes') {
        return;
    }
    var tenant = scopes.svySecurity.getTenant(tenant_name);
    if (!tenant) {
        plugins.dialogs.showErrorDialog('Error', utils.stringFormat('Cannot find tenant [%1$s].', [tenant_name]));
        return;
    }
    tenant.deleteRole(scopes.svySecurityConsole.svySecConsole_TenantRoleFilter);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"89864AD8-AD6B-4269-B660-8F1DDA0FA822"}
 */
function onActionAddRoleMember(event) {
    if (!tenant_name) {
        return;
    }
    
    if (!scopes.svySecurityConsole.svySecConsole_TenantRoleFilter) {
        plugins.dialogs.showInfoDialog('Selection Required','Please, select a role first.');
        return;
    }

    var tenantUsers = databaseManager.convertToDataSet(foundset.svy_sec_console_tenants_to_users, ['user_name']).getColumnAsArray(1);
    
    if (tenantUsers.length === 0) {
    	plugins.dialogs.showInfoDialog('No users','Please create users first.');
        return;
    }
    
    var userToAdd =  plugins.dialogs.showSelectDialog('Add Role User Member','Select the user to add to the selected role:', tenantUsers);
    if (!userToAdd) {
        return;
    }
    
    var tenant = scopes.svySecurity.getTenant(tenant_name);
    if (!tenant) {
        plugins.dialogs.showErrorDialog('Error', utils.stringFormat('Cannot find tenant [%1$s].', [tenant_name]));
        return;
    }
    var user = scopes.svySecurity.getUser(userToAdd,tenant_name);
    if (!user) {
        plugins.dialogs.showErrorDialog('Error', utils.stringFormat('Cannot find user [%1$s].', [userToAdd]));
        return;
    }
    user.addRole(scopes.svySecurityConsole.svySecConsole_TenantRoleFilter);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"BEEDF439-0669-404E-8B85-21AC380D7A17"}
 */
function onActionRemoveRoleMember(event) {
    if (!tenant_name) {
        return;
    }
    
    if (!scopes.svySecurityConsole.svySecConsole_TenantRoleFilter || !m_SelectedRoleUserMember) {
        plugins.dialogs.showInfoDialog('Selection Required','Please, select a role and a role user member first.');
        return;
    }

    var confirmBtn = 'Remove';
    var response = plugins.dialogs.showWarningDialog('Confirm Role Member Removal', utils.stringFormat('Do you want to remove user <b>%1$s</b> from the role <b>%2$s</b>?', [m_SelectedRoleUserMember, scopes.svySecurityConsole.svySecConsole_TenantRoleFilter]), 'No', confirmBtn);
    if (response != confirmBtn) {
        return;
    }
    
    var tenant = scopes.svySecurity.getTenant(tenant_name);
    if (!tenant) {
        plugins.dialogs.showErrorDialog('Error', utils.stringFormat('Cannot find tenant [%1$s].', [tenant_name]));
        return;
    }
    var user = scopes.svySecurity.getUser(m_SelectedRoleUserMember, tenant_name);
    if (!user) {
        plugins.dialogs.showErrorDialog('Error', utils.stringFormat('Cannot find user [%1$s] from tenant [%2$s].', [m_SelectedRoleUserMember, tenant_name]));
        return;
    }
    user.removeRole(scopes.svySecurityConsole.svySecConsole_TenantRoleFilter);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"7AC50E01-69CD-4055-BA7A-6B79A8C628D7"}
 */
function onActionGrantRolePermission(event) {
    if (!tenant_name) {
        return;
    }
    
    if (!scopes.svySecurityConsole.svySecConsole_TenantRoleFilter) {
        plugins.dialogs.showInfoDialog('Selection Required','Please, select a role first.');
        return;
    }

    var fsPermissions = datasources.db.svy_security.permissions.getFoundSet();
    fsPermissions.loadAllRecords();
    if (fsPermissions.getSize() == 0) {
        plugins.dialogs.showWarningDialog('No Permissions Available', 'No permissions are available in the system.');
        return;
    }
    var permissions = databaseManager.convertToDataSet(fsPermissions, ['permission_name']).getColumnAsArray(1);
    var permissionToAdd =  plugins.dialogs.showSelectDialog('Select Permission To Grant','Select the permission to grant to the selected role:', permissions);
    if (!permissionToAdd) {
        return;
    }
    
    var role = scopes.svySecurity.getRole(scopes.svySecurityConsole.svySecConsole_TenantRoleFilter, tenant_name);
    if (!role) {
        plugins.dialogs.showErrorDialog('Error', utils.stringFormat('Cannot find role [%1$s].', [scopes.svySecurityConsole.svySecConsole_TenantRoleFilter]));
        return;
    }

    role.addPermission(permissionToAdd);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"A2C40FC3-2C26-4261-B207-AC3425C41225"}
 */
function onActionRemoveRolePermission(event) {
    if (!tenant_name) {
        return;
    }
    
    if (!scopes.svySecurityConsole.svySecConsole_TenantRoleFilter || !m_SelectedRolePermission) {
        plugins.dialogs.showInfoDialog('Selection Required','Please, select a role and a role permission first.');
        return;
    }
    
    var response = plugins.dialogs.showWarningDialog('Confirm Role Permission Removal', 'Do you want to remove the selected permission from the selected role?', 'No', 'Yes');
    if (response != 'Yes') {
        return;
    }
    
    var role = scopes.svySecurity.getRole(scopes.svySecurityConsole.svySecConsole_TenantRoleFilter, tenant_name);
    if (!role) {
        plugins.dialogs.showErrorDialog('Error', utils.stringFormat('Cannot find role [%1$s].', [scopes.svySecurityConsole.svySecConsole_TenantRoleFilter]));
        return;
    }

    role.removePermission(m_SelectedRolePermission);
}
