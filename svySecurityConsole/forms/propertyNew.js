/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"9179CA81-A7B9-4D99-A194-8A22DBC04703"}
 */
var propertyValue = null;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"30774A88-0CC3-4A13-A7BA-71280E3D80A0"}
 */
var displayName = null;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"AD7073F9-C4A4-45E0-A988-D641E211D21E"}
 */
var propertyNamespace = null;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"795C89C7-3450-4503-B869-F035527C2533"}
 */
var propertyType = null;

/**
 * @public
 *
 * @properties={typeid:24,uuid:"CAE238C6-93A6-42B8-9547-2A5C9329B701"}
 */
function show() {
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
 * @properties={typeid:24,uuid:"4BFE90DD-8FFF-4ADB-A8D8-690674F71D4A"}
 */
function onShow(firstShow, event) { }

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"A4EBE169-75AB-4B2C-8FF1-502FE3FCC6ED"}
 */
function onActionDelete(event) {
	back()
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"DF256A19-6FD9-4EF6-9AB8-C8D123EF9034"}
 */
function onActionViewList(event) {
	forms.propertiesList.show();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"638D73F3-F3B9-45F4-A86C-51BEE27C0B3D"}
 */
function onActionSave(event) {

	var newProperty = scopes.svyProperties.createProperty(propertyNamespace, propertyValue, propertyType);
	if (newProperty) {
		newProperty.setDisplayName(displayName);
		back();
	}
	// TODO handle something went wrong
}

/**
 * @protected
 * @properties={typeid:24,uuid:"0F6B6EDC-644F-4230-85E6-99DA031CD06A"}
 */
function back() {
	forms.propertiesList.show();
	propertyNamespace = null;
	propertyType = null;
	propertyValue = null;
	displayName = null;
}
