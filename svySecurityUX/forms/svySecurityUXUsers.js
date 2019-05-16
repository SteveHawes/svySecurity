/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"9E6B619C-6F0F-47BA-A05D-81CF263FA64C"}
 */
var newUserName = '';

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"20AF5EC1-DC87-45E4-96DD-00E2491C83EB"}
 */
function onShow(firstShow, event) {
	scopes.svySecurityUX.setSelectedUser(foundset.user_name);
}

/**
 * Handle record selected.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"3A355438-1518-41B9-9DD7-C4816547FF2A"}
 */
function onRecordSelection(event) {
	scopes.svySecurityUX.setSelectedUser(foundset.user_name);
}

/**
 * @protected 
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"6C10F510-A289-4DDA-9D24-4666F08E6F9D"}
 */
function onActionNewRole(event) {
	newUserName = null;
	
	// hide role
	elements.fldNewRole.visible = true;

	elements.btnNewRole.visible = false;
	elements.iconNewRole.visible = false;
	elements.btnDeleteRole.visible = false;
	elements.iconDeleteRole.visible = false;
}

/**
 * @param {JSEvent} event
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"3D9471FF-E0AA-488A-982B-03ADF885DF44"}
 */
function onActionSaveRole(event) {
	createRole();
}

/**
 * @param oldValue
 * @param newValue
 * @param {JSEvent} event
 *
 * @return {boolean}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"72F57EC5-B60D-4491-B4A1-86ABFAAE0639"}
 */
function onDataChangeRole(oldValue, newValue, event) {
	// TODO Auto-generated method stub
	return true;
}

/**
 * @private
 *
 * @properties={typeid:24,uuid:"12B5BF9F-819E-430A-8B9B-E8F0E9BA205F"}
 */
function createRole() {

	if (newUserName) {
		var tenant = scopes.svySecurity.getTenant();
		try {

			if (!tenant.createUser(newUserName)) {
				throw "Ops something went wrong";
			}

		} catch (e) {

			if (e instanceof String) {
				elements.fldNewRole.toolTipText = e;
			} else {
				elements.fldNewRole.toolTipText = e.message;
			}
			elements.fldNewRole.addStyleClass("form-invalid");
			return;
		}
	}

	newUserName = null;
	
	// hide role
	elements.fldNewRole.visible = false;
	elements.fldNewRole.removeStyleClass("form-invalid");
	//elements.errorNewRole.text = null;
	//elements.errorNewRole.visible = false;

	elements.btnNewRole.visible = true;
	elements.iconNewRole.visible = true;
	elements.btnDeleteRole.visible = true;
	elements.iconDeleteRole.visible = true;
}

/**
 * @protected
 *
 * @properties={typeid:24,uuid:"5671D9E4-2485-4788-AAD6-F5744DC20D11"}
 */
function onActionDeleteRole() {
	var tenant = scopes.svySecurity.getTenant()
	tenant.deleteUser(foundset.user_name);
}
