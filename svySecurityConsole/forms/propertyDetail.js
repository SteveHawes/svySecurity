/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"86071965-3C22-48B7-B831-2C4467CC9032",variableType:4}
 */
var m_TotalSessionsHours = 0;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"B82FB694-CD5A-494B-97B7-19A6E39EB733",variableType:4}
 */
var m_ActiveSessionsCount = 0;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"95BBB8CB-0C90-4C15-A418-45390D3167B1",variableType:4}
 */
var m_TotalSessionsCount = 0;

/**
 * @private
 * @type {Date}
 * @SuppressWarnings (unused)
 *
 * @properties={typeid:35,uuid:"1AD3CEFC-5F67-4028-9DBF-ECAF91C82DC6",variableType:93}
 */
var m_LastRefreshDate = new Date();

/**
 * @private
 * @type {String}
 * @SuppressWarnings (unused)
 * @properties={typeid:35,uuid:"B6D967E9-15DD-4EF7-8968-DB7BE998B744"}
 */
var m_LockStausText = '';

/**
 * @private
 * @type {String}
 * @SuppressWarnings (unused)
 *
 * @properties={typeid:35,uuid:"40D3B1D0-95E7-463A-9028-5A1CC3E39B5A"}
 */
var m_LockReasonText = '';

/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"6D7658C6-2201-4FC4-A2AE-97AB672A1772"}
 */
var m_TenantName = '';

/**
 * @protected  
 * @type {String}
 *
 * @properties={typeid:35,uuid:"86B28D37-D030-40B5-8DFA-EC8CBB39D7DE"}
 */
var m_SelectedPermission = null;

/**
 * @public
 * @param {UUID} propertyUUID
 *
 * @properties={typeid:24,uuid:"34EED63B-65C5-4390-AE7D-0ACA905B4A5F"}
 */
function show(propertyUUID) {
	if (propertyUUID) {
		if (!foundset.loadRecords(propertyUUID)) {
			throw new Error(utils.stringFormat('Property "%1$s" was not found', [propertyUUID]));
		}
	} else {
		foundset.clear();
		m_TenantName = null;
	}

	refreshUserInfo();
	application.getWindow().show(this);
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"066BA68C-FA09-4B19-8DC7-FD73A5695374"}
 */
function onShow(firstShow, event) {
	if (user_name) {
		setHeaderText(utils.stringFormat('<span class="fa fa-user"></span> User [%1$s]', [user_name]));
	} else {
		setHeaderText('No User To Display');
	}
}

/**
 * @private
 * @properties={typeid:24,uuid:"91F4C6B1-8219-4387-BAF4-68BC68CBAFD6"}
 */
function refreshUserInfo() {
	m_LastRefreshDate = new Date();
}

/**
 * @private
 * @param {String} userName
 * @param {String} tenantName
 * @return {Number}
 * @properties={typeid:24,uuid:"31A2DE72-C65C-476C-97A1-0056648A1FFD"}
 */
function getTotalSessionHours(userName, tenantName) {
	var qry = datasources.db.svy_security.sessions.createSelect();
	qry.where.add(qry.columns.tenant_name.eq(tenantName)).add(qry.columns.user_name.eq(userName));
	qry.result.add(qry.columns.session_duration.sum);
	var ds = databaseManager.getDataSetByQuery(qry, 1);
	var res = ds.getValue(1, 1) || 0;
	return res / (1000 * 60 * 60);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"B3398638-C1E4-44B7-919F-1A485D71C1FB"}
 */
function onActionEditDisplayName(event) {
	var displayName = plugins.dialogs.showInputDialog('Edit Property', utils.stringFormat('Enter display name for property "%1$s"', [property_uuid]), display_name);
	if (displayName) {
		var property = scopes.svyProperties.getProperty(property_uuid);
		if (property) {
			property.setDisplayName(displayName);
			//the data broadcast will update the UI
		}
	}
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"DA9FB11B-0DD9-49CC-B90A-49E3061618A7"}
 */
function onActionRefresh(event) {
	refreshUserInfo();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"B143D532-4559-42B4-9763-92B73B5A38D4"}
 */
function onActionDelete(event) {

	var property = scopes.svyProperties.getProperty(property_uuid);
	if (!property) {
		return;
	}
	var btnDelete = 'Delete';
	var btnCancel = 'Cancel';
	var res = plugins.dialogs.showWarningDialog('Confirm Delete', utils.stringFormat('You are about to delete the property for user "%1$s".<br>There is no undo for this operation.<br>Do you want to continue?', [display_name]), btnCancel, btnDelete);
	if (res == btnDelete) {
		// res = property(user_name);
		res = scopes.svyProperties.deleteProperty(property);
		if (res) {
			forms.propertiesList.show();
		} else {
			plugins.dialogs.showWarningDialog('Delete Not Successful', 'Could not delete property.');
		}
	}
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"B2CA685C-BE16-47E6-98B2-13629D175D8C"}
 */
function onActionViewRoles(event) {
	// forms.userRoles.show(foundset);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"68945F96-D1B0-4BAC-BB6A-D5E5523032F8"}
 */
function onActionViewList(event) {
	forms.propertiesList.show();
}


/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"D03A296E-CAE0-4C41-B1DA-FEB496C485CF"}
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
 * @properties={typeid:24,uuid:"F7BDD86D-1E6D-440D-B840-D572E5FDE578"}
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