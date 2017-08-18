/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"EA6EFC2C-B5A7-4C47-AE38-1D39E085B714",variableType:4}
 */
var tenantCount = 0;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"400BAABE-752A-4016-978A-F5F7956FB127",variableType:4}
 */
var userCount = 0;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"F815E0A0-23A6-4F2F-B636-2DBEA5E660BC",variableType:4}
 */
var sessionCount = 0;

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
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"17628FA9-EFC8-4091-BFE4-637266BF5B3B"}
 */
function navTenantList(event) {
	nav(forms.tenantList);
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
	// TODO Auto-generated method stub
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
	// TODO Auto-generated method stub
}

/**
 * @properties={typeid:24,uuid:"1B00F1D6-9303-4988-8962-8125A010B5CB"}
 */
function updateTenantCount(){
	var q = datasources.db.svy_security.tenants.createSelect();
	q.result.add(q.columns.tenant_name.count);
	tenantCount = databaseManager.getDataSetByQuery(q,1).getValue(1,1);
}

/**
 * @properties={typeid:24,uuid:"B4FC6F5D-1E1B-4746-AFC6-748D5F6D7BBD"}
 */
function updateUserCount(){
	var q = datasources.db.svy_security.users.createSelect();
	q.result.add(q.columns.user_name.count);
	userCount = databaseManager.getDataSetByQuery(q,1).getValue(1,1);
}

/**
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
	sessionCount = databaseManager.getDataSetByQuery(q,1).getValue(1,1);
}

/**
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
	updateKPIs();
}
