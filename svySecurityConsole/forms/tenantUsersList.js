/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"91543EF9-9061-45D5-ADCC-6ABD5F438CB7"}
 */
var m_TenantName = null;

/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"5F595589-C157-45DF-B656-1F486D2D99CB"}
 */
var FS_FILTER_NAME = 'svySecurityConsole_TenantUsersFilter';

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
    foundset.removeFoundSetFilterParam(FS_FILTER_NAME);
    m_TenantName = null;

    if (tenantName) {
        m_TenantName = tenantName;

        foundset.addFoundSetFilterParam('tenant_name', '=', m_TenantName, FS_FILTER_NAME);

        if (!foundset.loadAllRecords()) {
            throw new Error(utils.stringFormat('Cannot load users for tenant "%1$s".', [tenantName]));
        }
    }

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
