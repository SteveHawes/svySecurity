/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"91543EF9-9061-45D5-ADCC-6ABD5F438CB7"}
 */
var m_TenantName = null;

/**
 * @override
 * @protected
 * @return {Array<String>}
 *
 * @properties={typeid:24,uuid:"2DBBE6B7-8EC9-478D-80C6-BB2B6AF73BED"}
 */
function getSearchProviders() {
    return ['user_name',
    'display_name'];
}

/**
 * @public
 * @param {String} tenantName
 *
 * @properties={typeid:24,uuid:"1FC63AFE-AC87-4FD3-9CAE-74AC3938E674"}
 */
function show(tenantName) {
    foundset.clear();
    m_TenantName = tenantName;
    onSearch();
    
    application.getWindow().show(this);
}

/**
 * @override
 * @protected
 * @properties={typeid:24,uuid:"36DC838C-4E88-4517-9864-99D6147F892F"}
 */
function showDetail() {
    if (user_name && tenant_name) {
        forms.userDetail.show(user_name, tenant_name);
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
 * @properties={typeid:24,uuid:"7FB70558-81CC-4039-9658-EE62ECC49F87"}
 */
function onShow(firstShow, event) {
    _super.onShow(firstShow, event);
    setHeaderText(utils.stringFormat('<span class="fa fa-users"></span> Users For Tenant [%1$s]', [m_TenantName]));
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"A53EB1AC-ADE7-4691-9F2A-8A55C8A14EEB"}
 */
function onActionCreateUser(event) {
    if (m_TenantName) {
        scopes.svySecurityConsole.addNewUser(m_TenantName);
    }
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"860B7B62-70AC-487B-80C3-B2EE3864ABDD"}
 */
function onActionShowTenant(event) {
    if (m_TenantName) {
        forms.tenantDetail.show(m_TenantName);
    }
}

/**
 * @override 
 * @protected 
 * @properties={typeid:24,uuid:"EEEEBE6B-120B-4C79-860C-8BE37863DFAE"}
 */
function onSearch(){
        
    var search = scopes.svySearch.createSimpleSearch(foundset);    
    search.setSearchText(getSearchText());
    var providers = getSearchProviders();
    for(var i in providers){
        search.addSearchProvider(providers[i]);
    }
    /** @type {QBSelect<db:/svy_security/users>} */
    var qry = search.getQuery();
        
    if (m_TenantName) {
        qry.where.add(qry.and.add(qry.columns.tenant_name.eq(m_TenantName)));
    }
        
    foundset.loadRecords(qry);
}