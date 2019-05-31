/**
 * @protected 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"EA6EFC2C-B5A7-4C47-AE38-1D39E085B714",variableType:4}
 */
var m_TenantCount = 0;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"400BAABE-752A-4016-978A-F5F7956FB127",variableType:4}
 */
var m_UserCount = 0;

/**
 * @protected 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"F815E0A0-23A6-4F2F-B636-2DBEA5E660BC",variableType:4}
 */
var m_SessionCount = 0;

/**
 * @type {Date}
 *
 * @properties={typeid:35,uuid:"8003CA54-5B5F-4C9B-8F7A-055DCCDA6216",variableType:93}
 */
var m_LastRefreshDate = new Date();

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"5DD18883-576C-4C57-BDD3-93A198767DD4"}
 */
function addTenant(event) {
	scopes.svySecurityConsole.addNewTenant();
}

/**
 * @public
 * @properties={typeid:24,uuid:"D0EE65D0-4348-4617-8090-C9F02EBE3AF1"}
 */
function show(){
    application.getWindow().show(this);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"17628FA9-EFC8-4091-BFE4-637266BF5B3B"}
 */
function navTenantList(event) {
	forms.tenantList.show();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"86AD6257-8074-42FF-A15D-36470AAEAD19"}
 */
function navUserList(event) {
	forms.usersList.show();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"F1FDDFCE-8198-4C86-AEBA-691980ADA70D"}
 */
function navSessionList(event) {
	forms.sessionsList.showAllActiveSessions();
}

/**
 * @private 
 * @properties={typeid:24,uuid:"1B00F1D6-9303-4988-8962-8125A010B5CB"}
 */
function updateTenantCount(){
	var q = datasources.db.svy_security.tenants.createSelect();
	q.result.add(q.columns.tenant_name.count);
	m_TenantCount = databaseManager.getDataSetByQuery(q,1).getValue(1,1);
}

/**
 * @private 
 * @properties={typeid:24,uuid:"B4FC6F5D-1E1B-4746-AFC6-748D5F6D7BBD"}
 */
function updateUserCount(){
	var q = datasources.db.svy_security.users.createSelect();
	q.result.add(q.columns.user_name.count);
	m_UserCount = databaseManager.getDataSetByQuery(q,1).getValue(1,1);
}

/**
 * @private
 * @properties={typeid:24,uuid:"27EDBB2B-55C6-4F4E-847A-D8E8E6286523"}
 */
function updateSessionCount(){
	var timeout = 30 * 60 * 1000; // 30 minutes
	var expiration = new Date();
	expiration.setTime(expiration.getTime() - timeout);
	var q = datasources.db.svy_security.sessions.createSelect();
	q.result.add(q.columns.id.count);
	q.where
		.add(q.columns.session_end.isNull)
		.add(q.columns.last_client_ping.gt(expiration))
	m_SessionCount = databaseManager.getDataSetByQuery(q,1).getValue(1,1);
}

/**
 * @private 
 * @properties={typeid:24,uuid:"043B4DF5-1736-4A87-B690-850F01BBAC39"}
 */
function updateKPIs(){
	updateSessionCount();
	updateTenantCount();
	updateUserCount();
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"20C5B324-C613-46C3-96F4-5BEF04705FD5"}
 */
function onShow(firstShow, event) {
    setHeaderText('<span class="fa fa-home"></span> Security Management Console');
    elements.lblVersionInfo.text = 'Using svySecurity version: ' + scopes.svySecurity.getVersion();
	refreshInfo();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"33C61AE7-7207-4F23-8310-784DF7A7F394"}
 */
function onActionRefresh(event) {
    refreshInfo();
}

/**
 * @private 
 * @properties={typeid:24,uuid:"4877EE0E-D50E-4FE4-B9FD-C90EB7CD4E24"}
 */
function refreshInfo() {
    m_LastRefreshDate = new Date();
    updateKPIs();
    refreshLeftChart();
    refreshRightChart();
}

/**
 * @private
 * @properties={typeid:24,uuid:"1C1E3136-4785-498A-AE8D-FB5B97B9706A"}
 */
function refreshLeftChart(){
    scopes.svySecurityConsole.createChartTenantsWithMostUsers(elements.chartLeft);    
}

/**
 * @private
 * @properties={typeid:24,uuid:"1DE56846-EFA3-4C42-B2E4-8F824E5BFAE9"}
 */
function refreshRightChart(){
    scopes.svySecurityConsole.createChartTotalUsageOverTimeMonths(elements.chartRight);
}
/**
 * @param {Number} dataset_index
 * @param {Number} index
 * @param {string} label
 * @param {Number} value
 *
 * @private
 *
 * @properties={typeid:24,uuid:"E4F633EC-A36B-49DD-8549-D34C4EA12267"}
 */
function onClickLeftChart(dataset_index, index, label, value) {
    var tenantName = label;
    if (tenantName) {
        forms.tenantDetail.show(tenantName);
    }
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"7451540A-5CEC-4CDF-87D5-5E0FD0A514D1"}
 */
function onActionViewProperties(event) {
	forms.propertiesList.show();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"FEF322EE-457B-490B-AC3E-4C82F236A447"}
 */
function onActionViewNavigation(event) {
	forms.securityModule.show('navigationHome')
}

/**
 * Callback method when form is (re)loaded.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"0EB8C7BC-92F4-47F3-8475-12EE8D3DA4A3"}
 */
function onLoad(event) {
	// TODO improve loading mechanism of modules, shall be as complex as SampleGallery !?
	if (forms['navigationHome']) {
		elements.btnViewNavigation.visible = true;
	}
}
