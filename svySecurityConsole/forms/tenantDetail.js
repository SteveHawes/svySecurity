/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"ED312D51-9280-479A-9F75-C9D2BFDF3DD8",variableType:4}
 */
var m_TenantUserCount = 0;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"DB1D5971-0081-40AA-9DAA-1E13FF327805",variableType:4}
 */
var m_ActiveSessionsCount = 0;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"5600A100-9456-4203-88F2-09371C990202",variableType:4}
 */
var m_TotalSessionsCount = 0;

/**
 * @private
 * @type {Date}
 * @SuppressWarnings (unused)
 *
 * @properties={typeid:35,uuid:"E55E8172-24A7-47D3-BA3B-76EEF44CA337",variableType:93}
 */
var m_LastRefreshDate = new Date();

/**
 * @private
 * @type {String}
 * @SuppressWarnings (unused)
 * @properties={typeid:35,uuid:"F34A116D-B41B-4ADD-A9B8-8312282A070E"}
 */
var m_LockStausText = '';

/**
 * @private
 * @type {String}
 * @SuppressWarnings (unused)
 *
 * @properties={typeid:35,uuid:"5E47CB1E-8983-4E03-A035-788038C57F8F"}
 */
var m_LockReasonText = '';

/**
 * @public
 * @param {String} tenantName
 *
 * @properties={typeid:24,uuid:"437F313B-B560-4E88-8044-15E79104D941"}
 */
function show(tenantName) {
    if (tenantName) {
        if (!foundset.loadRecords(databaseManager.convertToDataSet([tenantName]))) {
            throw new Error(utils.stringFormat('Tenant "%1$s" was not found.', [tenantName]));
        }

    } else {
        foundset.clear();
    }

    refreshTenantInfo();
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
 * @properties={typeid:24,uuid:"F376E047-C59D-47E0-8C6D-E3BEB05C62A8"}
 */
function onShow(firstShow, event) {
    if (tenant_name) {
        setHeaderText(utils.stringFormat('<span class="fa fa-shield"></span> Tenant [%1$s]', [tenant_name]));
    } else {
        setHeaderText('No Tenant To Display');
    }
}

/**
 * @private
 * @properties={typeid:24,uuid:"8B60C437-B2F1-4AF1-8B60-2E8C66143E99"}
 */
function refreshTenantInfo() {
    var tenant = null;
    if (tenant_name) {
        tenant = scopes.svySecurity.getTenant(tenant_name);
    }

    if (tenant) {
        m_TenantUserCount = tenant.getUsers().length;
        m_ActiveSessionsCount = tenant.getActiveSessions().length;
        m_TotalSessionsCount = tenant.getSessionCount();
        var isLocked = tenant.isLocked();
        if (isLocked) {
            var m_LockExp = tenant.getLockExpiration();
            if (m_LockExp) {
                m_LockStausText = utils.stringFormat('Account is <b>Locked</b> - the lock expires on %1$tc ', [m_LockExp]);
            } else {
                m_LockStausText = 'Account is <b>Locked</b>';
            }
            m_LockReasonText = tenant.getLockReason();
            elements.btnLock.text = 'Unlock Tenant';
        } else {
            m_LockStausText = 'Account is <b>Active</b>';
            m_LockReasonText = null;
            elements.btnLock.text = 'Lock Tenant';
        }
        
        scopes.svySecurityConsole.createChartTotalTenantUsageOverTimeMonths(tenant_name,elements.chart);
    } else {
        m_TenantUserCount = 0;
        m_ActiveSessionsCount = 0;
        m_TotalSessionsCount = 0;
        m_LockStausText = 'no tenant';
        m_LockReasonText = null;
        elements.btnLock.text = 'Lock';
    }

    m_LastRefreshDate = new Date();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"C8A67467-349D-456B-B51C-E1EA0DE8E8D1"}
 */
function onActionEditDisplayName(event) {
    if (tenant_name) {
        var displName = plugins.dialogs.showInputDialog('Edit Tenant', utils.stringFormat('Enter display name for tenant "%1$s"', [tenant_name]), display_name);
        if (displName) {
            var tenant = scopes.svySecurity.getTenant(tenant_name);
            if (tenant) {
                tenant.setDisplayName(displName);
                //the data broadcast will update the UI
            }
        }
    }
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"3DEEB6F0-353F-4B6E-9DBD-D33C65296E00"}
 */
function onActionShowTenants(event) {
    forms.tenantList.show();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"AFB24584-4F66-4C11-9167-75D9DD840A95"}
 */
function onActionRefresh(event) {
    refreshTenantInfo();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"E12D8A07-584B-485B-B5D7-95F10378B2BF"}
 */
function onActionLockUnlock(event) {
    if (!tenant_name) {
        return;
    }
    var tenant = scopes.svySecurity.getTenant(tenant_name);
    if (!tenant) {
        return;
    }

    if (tenant.isLocked()) {
        tenant.unlock();
    } else {
        var res = forms.accountLockDialog.showDialog('Lock Tenant Account');
        if (res) {
            tenant.lock(res.reason, res.duration);
        }
    }
    refreshTenantInfo();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"27239A8F-2183-4640-A17B-889F6934739C"}
 */
function onActionDelete(event) {
    if (!tenant_name) {
        return;
    }
    var tenant = scopes.svySecurity.getTenant(tenant_name);
    if (!tenant) {
        return;
    }
    var btnDelete = 'Delete';
    var btnCancel = 'Cancel';
    var res = plugins.dialogs.showWarningDialog('Confirm Delete', utils.stringFormat('You are about to delete the account for tenant "%1$s" and all users associated with it.<br>There is no undo for this operation.<br>Do you want to continue?', [tenant_name]), btnCancel, btnDelete);
    if (res == btnDelete) {
        res = scopes.svySecurity.deleteTenant(tenant);
        if (res) {
            forms.tenantList.show();
        } else {
            plugins.dialogs.showWarningDialog('Delete Not Successful', 'Could not delete tenant.');
        }
    }
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"FB4518E9-51FE-42DA-95F9-CB1A52963192"}
 */
function onActionShowTenantUsers(event) {
    if (tenant_name) {
        forms.tenantUsersList.show(tenant_name);
    }
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"9CB0887B-BE71-4DEC-81EB-5AC4F3A7DD30"}
 */
function onActionCreateUser(event) {
    if (tenant_name) {
        scopes.svySecurityConsole.addNewUser(tenant_name);
    }
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"2560E870-E4FB-469D-B7AA-222295D6CADB"}
 */
function onActionAllSessions(event) {
    if (tenant_name) {
        forms.sessionsList.showTenantSessions(tenant_name);
    }
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"22A2B524-FEE2-4E80-85D4-B3079783396A"}
 */
function onActionShowActiveSessions(event) {
    if (tenant_name) {
        forms.sessionsList.showTenantActiveSessions(tenant_name);
    }
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"EBB65C46-D9C9-4614-82C3-149B99DF2ADE"}
 */
function onActionViewRoles(event) {
    forms.tenantRoles.show(foundset);
}
