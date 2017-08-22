
/**
 * @protected 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"F4A2C1D9-D1E3-449F-BF27-DF409485025B"}
 */
var m_SelectedRole = null;

/**
 * @protected  
 * @type {String}
 *
 * @properties={typeid:35,uuid:"CE6A0C90-9092-4B6D-91FF-1C2E54E44ED4"}
 */
var m_SelectedPermission = null;

/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"16939C0D-BE05-4479-8416-EA0430236068"}
 */
var USER_PERMISSIONS_VALUELIST_NAME = 'vls_sys_sec_console_UserPermissions';

/**
 * @public 
 * @param {JSFoundSet<db:/svy_security/users>} fs
 *
 * @properties={typeid:24,uuid:"82E58B7F-7843-4D87-8E2B-72BDA76D1F4E"}
 */
function show(fs){
    controller.loadRecords(fs);
    
    refreshUserPermissions();
    application.getWindow().show(this);
}

/**
 * @private 
 * @properties={typeid:24,uuid:"584D9D10-9157-4C7B-B70B-EB17B9A9C9E2"}
 */
function refreshUserPermissions(){
    application.setValueListItems(USER_PERMISSIONS_VALUELIST_NAME, []);
    
    if (!tenant_name || !user_name) {
        return;
    }
    
    var user = scopes.svySecurity.getUser(user_name, tenant_name);
    if (!user) {
        return;
    }
    
    var permissions = user.getPermissions();
    var ds = databaseManager.createEmptyDataSet(0, ['display_value', 'real_value']);
    for (var index = 0; index < permissions.length; index++) {
        var permission = permissions[index];
        ds.addRow([permission.getName(), permission.getName()]);
    }
    
    application.setValueListItems(USER_PERMISSIONS_VALUELIST_NAME, ds);
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"A2D00974-63B2-410D-B89F-5976876879E7"}
 */
function onShow(firstShow, event) {
    if (tenant_name) {
        setHeaderText(utils.stringFormat('Roles For User [%1$s]', [user_name]));
    } else {
        setHeaderText('No User To Display');
    }
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"5A0D7DC5-53EC-430D-AD5D-8FA80E29305F"}
 */
function onActionShowUser(event) {
    if (user_name) {
        forms.userDetail.show(user_name,tenant_name);
    }
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"EB5DF68D-5B39-4908-9BB3-0B8DC15217F3"}
 */
function onActionAddRole(event) {
    if (!tenant_name || !user_name) {
        return;
    }

    var tenant = scopes.svySecurity.getTenant(tenant_name);
    if (!tenant) {
        plugins.dialogs.showErrorDialog('Error', utils.stringFormat('Cannot find tenant [%1$s].', [tenant_name]));
        return;
    }
    
    var user = scopes.svySecurity.getUser(user_name, tenant_name);
    if (!user) {
        plugins.dialogs.showErrorDialog('Error', utils.stringFormat('Cannot find user [%1$s] from tenant [%2$s].', [user_name, tenant_name]));
        return;
    }
    
    var tenantRoles = tenant.getRoles();
    var rolesArray = [];
    for (var index = 0; index < tenantRoles.length; index++) {
        rolesArray.push(tenantRoles[index].getName());
    }
    
    var roleToAdd =  plugins.dialogs.showSelectDialog('Add User To Role','Select the role to which you want to add the selected user:', rolesArray);
    
    if (!roleToAdd) {
        return;
    }
    
    user.addRole(roleToAdd);
    refreshUserPermissions();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"374BFE86-5EF8-4877-95FD-1C09435C5770"}
 */
function onActionRemoveRole(event) {
    if (!tenant_name || !user_name || !m_SelectedRole) {
        return;
    }

    var user = scopes.svySecurity.getUser(user_name, tenant_name);
    if (!user) {
        plugins.dialogs.showErrorDialog('Error', utils.stringFormat('Cannot find user [%1$s] from tenant [%2$s].', [user_name, tenant_name]));
        return;
    }
    
    
    var confirmBtn = 'Remove';
    var response =  plugins.dialogs.showWarningDialog('Remove User From Role', utils.stringFormat('Do you want to remove user <b>%1$s</b> from role <b>%2$s</b>?', [user_name, m_SelectedRole]), 'No', confirmBtn);
    
    if (response != confirmBtn) {
        return;
    }
    
    user.removeRole(m_SelectedRole);
    refreshUserPermissions();
}
