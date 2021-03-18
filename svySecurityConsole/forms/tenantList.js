
/**
 * @override 
 * @protected 
 * @return {Array<String>}
 *
 * @properties={typeid:24,uuid:"8B0E5FBC-4790-4AA0-BB43-FC56BD8AF429"}
 */
function getSearchProviders() {
	return [
		'tenant_name',
		'display_name'
	];
}

/**
 * @override 
 * @protected 
 * @properties={typeid:24,uuid:"B3862F8D-9943-4DD0-B594-AEC4AEAF5FC4"}
 */
function showDetail(){
    if (tenant_name) {
        forms.tenantDetail.show(tenant_name);
    }
}

/**
 * Callback method for when form is shown.
 * @override 
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"14C81191-6DD4-4394-B15A-E935BEDDF490"}
 */
function onShow(firstShow, event) {
    _super.onShow(firstShow,event);
    setHeaderText('<span class="fas fa-shield-alt"></span> Tenants');
}
/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"8A300CEF-68CA-4426-8996-A7207FDDA5F9"}
 */
function onActionCreateTenant(event) {
    scopes.svySecurityConsole.addNewTenant();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"D5A99C94-81ED-4921-8BFD-BE98A30E8D06"}
 */
function onActionCreateSubTenant(event) {
	if (utils.hasRecords(foundset)) {
		scopes.svySecurityConsole.addNewTenant(foundset.getSelectedRecord(), true);
	}
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"B329E8C1-AF47-4049-A224-F6AF1A40DA38"}
 */
function onActionCloneTenant(event) {
	if (utils.hasRecords(foundset)) {
		scopes.svySecurityConsole.addNewTenant(foundset.getSelectedRecord(), false);
	}
}

/**
 * @public 
 * @properties={typeid:24,uuid:"45D3644E-9404-4144-9DA8-891BBE27899F"}
 */
function show() {
    application.getWindow().show(this);
}