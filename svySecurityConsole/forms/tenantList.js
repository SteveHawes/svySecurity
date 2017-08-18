
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
    setHeaderText('<span class="fa fa-shield"></span> Tenants');
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
