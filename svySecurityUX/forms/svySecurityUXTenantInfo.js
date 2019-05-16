/**
 * @protected 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"AC151136-BEA3-48FC-B52E-FC60921FD046",variableType:4}
 */
var activeSessions = 0;

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"BFFEFFCE-6ABE-4572-B308-BA93FD0851B9"}
 */
function onShow(firstShow, event) {
	var tenant = scopes.svySecurity.getTenant();
	activeSessions = tenant.getActiveSessions().length;
	updateUI();
}

/**
 * Handle record selected.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"B121EB61-8408-4012-BFF3-ADAA71C4B737"}
 */
function onRecordSelection(event) {
	updateUI();
}

/**
 * @protected 
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"4286147E-324E-48B2-80A9-1F5344A0A1CF"}
 */
function onActionLock(event) {
	var msg = "Locks the tenant account preventing its users from logging in.\n"
	msg += "The lock will remain in place until it is removed. Users with active sessions will be unaffected until subsequent login attempts."

	var tenant = scopes.svySecurity.getTenant();
	var answer = plugins.dialogs.showQuestionDialog("Do you wish to lock the Tenant " + tenant.getDisplayName(), msg, "Yes", "No");
	if (answer == "yes") {
		tenant.lock();
		updateUI();
	}
}

/**
 * @param {JSEvent} event
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"AB106273-1B8B-4BF5-A343-7E148F1F7A38"}
 */
function onActionUnlock(event) {
	var tenant = scopes.svySecurity.getTenant();
	tenant.unlock()
	updateUI();
}

/**
 * @protected
 * @properties={typeid:24,uuid:"FDB4C889-7BB5-415F-A4C3-A878F8AADED4"}
 */
function updateUI() {
	var tenant = scopes.svySecurity.getTenant();
	if (tenant.isLocked()) {
		elements.faLocked.visible = true;
		elements.faUnlocked.visible = false;
	} else {
		elements.faLocked.visible = false;
		elements.faUnlocked.visible = true;
	}

	if (tenant.isMasterTenant()) {
		elements.faMaster.enabled = true;
	} else {
		elements.faMaster.enabled = false;
	}
	
    scopes.svySecurityUXCharts.createChartTotalTenantUsageOverTimeMonths(foundset.tenant_name,elements.chart);

}
