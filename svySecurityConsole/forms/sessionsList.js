/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"74DCCA34-C5F9-4528-B615-2B3C5B044821"}
 */
var m_TenantName = null;

/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"D6C1DE39-8B70-4670-830F-98533572721E"}
 */
var m_UserName = null;

/**
 * @private 
 * @properties={typeid:35,uuid:"19757376-18A7-47CA-AB48-599DF10D75BA",variableType:-4}
 */
var m_ActiveSessionsOnly = false;

/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"55F80A5C-4BF3-4B6A-B3AB-CECB78604CDF"}
 */
var FS_FILTER_NAME_TENANT = 'svySecurityConsole_SessionsTenantFilter';

/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"D7C7C55F-EA27-4BEC-A0A1-5654CE877AFD"}
 */
var FS_FILTER_NAME_USER = 'svySecurityConsole_SessionsUserFilter';

/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"7B2FC026-3BDD-45C8-B470-1666197BAF08"}
 */
var FS_FILTER_NAME_SESSION_END = 'svySecurityConsole_SessionsEndFilter';

/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"9E46308F-ACE6-4FF0-8617-4DE12389B707"}
 */
var FS_FILTER_NAME_SESSION_LAST_PING = 'svySecurityConsole_SessionsLastPingFilter';

/**
 * @override
 * @protected
 * @return {Array<String>}
 *
 * @properties={typeid:24,uuid:"103D1A3C-C6BA-434A-9646-C1E7345AC49D"}
 */
function getSearchProviders() {
    return ['tenant_name', 'user_name', 'ip_address', 'id'];
}

/**
 * @public
 * @param {String} tenantName
 *
 * @properties={typeid:24,uuid:"87DF1623-6659-49D5-AB63-3CC37124785C"}
 */
function showTenantActiveSessions(tenantName) {
    m_TenantName = tenantName;    
    m_UserName = null;
    m_ActiveSessionsOnly = true;
    clearFilters();
    
    onSearch();

    application.getWindow().show(this);
}

/**
 * @public
 * @param {String} tenantName
 *
 * @properties={typeid:24,uuid:"E75FA804-55D8-4CDF-A84A-4B72DE1E28A6"}
 */
function showTenantSessions(tenantName) {
    m_TenantName = tenantName;    
    m_UserName = null;
    m_ActiveSessionsOnly = false;
    clearFilters();
    
    onSearch();

    application.getWindow().show(this);
}

/**
 * @public
 * @param {String} tenantName
 * @param {String} userName
 *
 * @properties={typeid:24,uuid:"EF81D550-1DC9-481B-A22C-E48D420A6807"}
 */
function showUserActiveSessions(tenantName, userName) {
    m_TenantName = tenantName;    
    m_UserName = userName;
    m_ActiveSessionsOnly = true;
    clearFilters();    
    onSearch();

    application.getWindow().show(this);
}

/**
 * @public
 * @param {String} tenantName
 * @param {String} userName
 *
 * @properties={typeid:24,uuid:"814393A3-7D59-47C3-B325-501D4FE07F24"}
 */
function showUserSessions(tenantName, userName) {
    m_TenantName = tenantName;    
    m_UserName = userName;
    m_ActiveSessionsOnly = false;
    clearFilters();    
    onSearch();

    application.getWindow().show(this);
}

/**
 * @public
 *
 * @properties={typeid:24,uuid:"082B1C7A-F7D2-46C8-A85A-E63E8F226FB1"}
 */
function showAllActiveSessions() {
    m_TenantName = null;    
    m_UserName = null;
    m_ActiveSessionsOnly = true;
    clearFilters();    
    onSearch();

    application.getWindow().show(this);
}

/**
 * @public
 *
 * @properties={typeid:24,uuid:"B6361C04-D834-49CF-8A35-421442C9E035"}
 */
function showAllSessions() {
    m_TenantName = null;    
    m_UserName = null;
    m_ActiveSessionsOnly = false;
    clearFilters();    
    onSearch();

    application.getWindow().show(this);
}

/**
 * @private
 * @properties={typeid:24,uuid:"3BDE6298-7DF0-4C5F-9AF8-CD30AE6F5041"}
 */
function clearFilters() {
    foundset.removeFoundSetFilterParam(FS_FILTER_NAME_TENANT);
    foundset.removeFoundSetFilterParam(FS_FILTER_NAME_USER);
    foundset.removeFoundSetFilterParam(FS_FILTER_NAME_SESSION_END);
    foundset.removeFoundSetFilterParam(FS_FILTER_NAME_SESSION_LAST_PING);
    setSearchText('');
}

/**
 * @override 
 * @protected 
 * @properties={typeid:24,uuid:"BF62CE20-5402-4AEA-A849-6B83A038F09E"}
 */
function onSearch(){
    
    foundset.removeFoundSetFilterParam(FS_FILTER_NAME_TENANT);
    foundset.removeFoundSetFilterParam(FS_FILTER_NAME_USER);
    foundset.removeFoundSetFilterParam(FS_FILTER_NAME_SESSION_END);
    foundset.removeFoundSetFilterParam(FS_FILTER_NAME_SESSION_LAST_PING);
    
    if (m_TenantName) {

        foundset.addFoundSetFilterParam('tenant_name', '=', m_TenantName, FS_FILTER_NAME_TENANT);
    }
    
    if (m_UserName) {
        foundset.addFoundSetFilterParam('user_name', '=', m_UserName, FS_FILTER_NAME_USER);
        
    }
    
    if (m_ActiveSessionsOnly) {
        foundset.addFoundSetFilterParam('session_end', '^||=', null, FS_FILTER_NAME_SESSION_END);
        var expiration = new Date();        
        expiration.setTime(expiration.getTime() - scopes.svySecurity.getInactiveSessionTimeout());
        foundset.addFoundSetFilterParam('last_client_ping', '>', utils.dateFormat(expiration, 'yyyy-MM-dd HH:mm:ss') + '|yyyy-MM-dd HH:mm:ss' , FS_FILTER_NAME_SESSION_LAST_PING);                
    }
    _super.onSearch();
}

/**
 * @override
 * @protected
 * @properties={typeid:24,uuid:"35395224-50BE-4E31-B91C-14A758B05628"}
 */
function showDetail() {
//    if (user_name && tenant_name) {
//        forms.userDetail.show(user_name, tenant_name);
//    }
}

/**
 * Callback method for when form is shown.
 * @override
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"70F6A1CC-98DC-4F9C-A715-25304518189C"}
 */
function onShow(firstShow, event) {
    _super.onShow(firstShow, event);
    var headerText = '';
    var activeSessionsText = m_ActiveSessionsOnly ? 'Active Sessions' : 'All Sessions';
    
    if (m_UserName) {
        elements.btnShowParentScreen.visible = true;
        elements.btnShowParentScreen.text = '<span class="fa fa-user" />';
        headerText = utils.stringFormat('%1$s For User [%2$s]', [activeSessionsText, m_UserName]);
    }
    else if (m_TenantName) {
        elements.btnShowParentScreen.visible = true;
        elements.btnShowParentScreen.text = '<span class="fa fa-shield" />';
        headerText = utils.stringFormat('%1$s For Tenant [%2$s]', [activeSessionsText, m_TenantName]);
    }
    else {
        elements.btnShowParentScreen.visible = false;
        elements.btnShowParentScreen.text = '';
        headerText = utils.stringFormat('%1$s', [activeSessionsText]);
    }
    
    setHeaderText(headerText);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"25616BFD-CD29-4F48-8F04-109A19DE86CB"}
 */
function onActionShowParentScreen(event) {
    if (m_TenantName && m_UserName) {
        forms.userDetail.show(m_UserName, m_TenantName);
    }
    else if (m_TenantName) {
        forms.tenantDetail.show(m_TenantName);
    }
    else {
        forms.home.show();
    }
}
