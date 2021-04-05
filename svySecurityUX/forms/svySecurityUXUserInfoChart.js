/**
 * Handle record selected.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"464F219B-97FB-41E3-89B1-65EFB0A994B4"}
 */
function onRecordSelection(event) {
	updateUI();
}

/**
 * Update the chart
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"52D71AE2-D2FC-42CA-A4E5-A4AB43433809"}
 */
function updateUI() {
	scopes.svySecurityUXCharts.createChartUserUsageOverTimeMonths(tenant_name, user_name, elements.chart);
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"83B89060-604B-42AC-BFA5-39D79B25BF4B"}
 */
function onShow(firstShow, event) {
	updateUI();
}
