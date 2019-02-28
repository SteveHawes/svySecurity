/**
 * @protected  
 * @type {String}
 *
 * @properties={typeid:35,uuid:"521BA9C3-A744-4302-8D15-6E61306E2C95"}
 */
var m_SelectedPermission = null;

/**
 * @public 
 * @param {JSFoundSet<db:/svy_security/users>} fs
 *
 * @properties={typeid:24,uuid:"45627903-E419-46F5-A9C0-5DDAF30C28DD"}
 */
function show(fs){
    controller.loadRecords(fs);
    
    application.getWindow().show(this);
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"67BDA99B-F7A3-417B-B6FE-3764BDE97CA2"}
 */
function onShow(firstShow, event) {
    if (display_name) {
        setHeaderText(utils.stringFormat('Permissions For Property [%1$s]', [display_name]));
    } else {
        setHeaderText('No Property To Display');
    }
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"CA0E4A39-1842-44E3-952B-2DBACCCAE31F"}
 */
function onActionShowProperty(event) {
    if (property_uuid) {
        forms.propertyDetail.show(property_uuid)
    }
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"97A4DF03-5C38-497A-B788-3E0BF32AF5F1"}
 */
function onActionAddPermission(event) {
    if (!property_uuid) {
        return;
    }
    
    var fsPermissions = datasources.db.svy_security.permissions.getFoundSet();
    fsPermissions.loadAllRecords();
    if (fsPermissions.getSize() == 0) {
        plugins.dialogs.showWarningDialog('No Permissions Available', 'No permissions are available in the system.');
        return;
    }
    var permissions = databaseManager.convertToDataSet(fsPermissions, ['permission_name']).getColumnAsArray(1);
    var permissionToAdd =  plugins.dialogs.showSelectDialog('Select Permission To Grant','Select the permission to grant to the selected property:', permissions);
    if (!permissionToAdd) {
        return;
    }
    
    var property = scopes.svyProperties.getProperty(property_uuid);
    
    var permission = scopes.svySecurity.getPermission(permissionToAdd);
    permission.addProperty(property);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"E74DB18E-58F7-4845-BDF0-16C7C7EE0CE2"}
 */
function onActionRemovePermission(event) {
	
    if (!property_uuid) {
        return;
    }
    
    if (!m_SelectedPermission) {
        plugins.dialogs.showInfoDialog('Selection Required','Please, select a permission first.');
        return;
    }

    var permission = scopes.svySecurity.getPermission(m_SelectedPermission);
    if (!permission) {
        plugins.dialogs.showErrorDialog('Error', utils.stringFormat('Cannot find Permission [%1$s]', [m_SelectedPermission]));
        return;
    }
    
    
    var confirmBtn = 'Remove';
    var response =  plugins.dialogs.showWarningDialog('Remove Permission From Property', utils.stringFormat('Do you want to remove permission <b>%1$s</b> from property <b>%2$s</b>?', [m_SelectedPermission, display_name]), 'No', confirmBtn);
    
    if (response != confirmBtn) {
        return;
    }
    
    var property = scopes.svyProperties.getProperty(property_uuid);
    
    permission.removeProperty(property);
}
