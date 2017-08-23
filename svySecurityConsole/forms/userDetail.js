/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"FD777B5C-14F9-4F33-A557-76EE01B53B9B",variableType:4}
 */
var m_TotalSessionsHours = 0;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"9B721FA7-BDC4-47C4-B1E8-418EA7B10866",variableType:4}
 */
var m_ActiveSessionsCount = 0;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"8FA3065E-B482-47D0-9205-99A907CB6105",variableType:4}
 */
var m_TotalSessionsCount = 0;

/**
 * @private
 * @type {Date}
 * @SuppressWarnings (unused)
 *
 * @properties={typeid:35,uuid:"93DBC881-CD3F-4484-A41F-FD3F89944594",variableType:93}
 */
var m_LastRefreshDate = new Date();

/**
 * @private
 * @type {String}
 * @SuppressWarnings (unused)
 * @properties={typeid:35,uuid:"560C2C59-1767-43E2-BEC5-304ECF38877B"}
 */
var m_LockStausText = '';

/**
 * @private
 * @type {String}
 * @SuppressWarnings (unused)
 *
 * @properties={typeid:35,uuid:"8E5765AE-EE10-4296-A39C-93BA27A0DBB0"}
 */
var m_LockReasonText = '';

/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"7EE58DC1-F7D1-4547-810B-DCB48FE61451"}
 */
var m_TenantName = '';

/**
 * @public
 * @param {String} userName
 * @param {String} tenantName
 *
 * @properties={typeid:24,uuid:"5DC58B4B-92F9-4DFE-A994-E894CF0A0435"}
 */
function show(userName, tenantName) {
    if (tenantName && userName) {
        m_TenantName = tenantName;
        if (!foundset.loadRecords(databaseManager.convertToDataSet([{ tenant: tenantName, user: userName }], ['tenant', 'user']))) {
            throw new Error(utils.stringFormat('User "%1$s" was not found in tenant "%2$s".', [userName, tenantName]));
        }

    } else {
        foundset.clear();
        m_TenantName = null;
    }

    refreshUserInfo();
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
 * @properties={typeid:24,uuid:"3EA203A8-76F5-4EC9-9C04-EE427CB20969"}
 */
function onShow(firstShow, event) {
    if (user_name) {
        setHeaderText(utils.stringFormat('<span class="fa fa-user"></span> User [%1$s]', [user_name]));
    } else {
        setHeaderText('No User To Display');
    }
}

/**
 * @private
 * @properties={typeid:24,uuid:"64BBB55C-E442-4A3F-A38A-8169EF98CC5E"}
 */
function refreshUserInfo() {
    var user = null;
    if (tenant_name && user_name) {
        user = scopes.svySecurity.getUser(user_name, tenant_name);
    }

    if (user) {
        m_TotalSessionsCount = user.getSessionCount();
        m_TotalSessionsHours = getTotalSessionHours(user_name, tenant_name);
        m_ActiveSessionsCount = user.getActiveSessions().length;
        var isLocked = user.isLocked();
        if (isLocked) {
            var m_LockExp = user.getLockExpiration();
            if (m_LockExp) {
                m_LockStausText = utils.stringFormat('Account is <b>Locked</b> - the lock expires on %1$tc ', [m_LockExp]);
            } else {
                m_LockStausText = 'Account is <b>Locked</b>';
            }
            m_LockReasonText = user.getLockReason();
            elements.btnLock.text = 'Unlock User';
        } else {
            m_LockStausText = 'Account is <b>Active</b>';
            m_LockReasonText = null;
            elements.btnLock.text = 'Lock User';
        }
        
        scopes.svySecurityConsole.createChartUserUsageOverTimeMonths(tenant_name,user_name,elements.chart);
    } else {
        m_TotalSessionsCount = 0;
        m_TotalSessionsHours = 0;
        m_ActiveSessionsCount = 0;
        m_LockStausText = 'no user';
        m_LockReasonText = null;
        elements.btnLock.text = 'Lock';
    }

    m_LastRefreshDate = new Date();
}

/**
 * @private
 * @param {String} userName
 * @param {String} tenantName
 * @return {Number}
 * @properties={typeid:24,uuid:"3D90AB26-DE58-494D-99BA-733D2DDE56F5"}
 */
function getTotalSessionHours(userName, tenantName){
    var qry = datasources.db.svy_security.sessions.createSelect();
    qry.where.add(qry.columns.tenant_name.eq(tenantName)).add(qry.columns.user_name.eq(userName));
    qry.result.add(qry.columns.session_duration.sum);    
    var ds = databaseManager.getDataSetByQuery(qry,1);
    var res = ds.getValue(1, 1) || 0;
    return res / (1000 * 60 * 60);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"17DEDFEC-4716-4343-88A9-1D410F729EC5"}
 */
function onActionEditDisplayName(event) {
    if (tenant_name && user_name) {
        var displayName = plugins.dialogs.showInputDialog('Edit User', utils.stringFormat('Enter display name for user "%1$s"', [user_name]), display_name);
        if (displayName) {
            var user = scopes.svySecurity.getUser(user_name, tenant_name);
            if (user) {
                user.setDisplayName(displayName);
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
 * @properties={typeid:24,uuid:"27D1FC2A-F68C-42BE-A3FF-F5EBA6C47EB5"}
 */
function onActionRefresh(event) {
    refreshUserInfo();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"409C050E-BF1D-4B67-81E4-FF6430402EB9"}
 */
function onActionLockUnlock(event) {
    if (!tenant_name || !user_name) {
        return;
    }
    var user = scopes.svySecurity.getUser(user_name, tenant_name);
    if (!user) {
        return;
    }

    if (user.isLocked()) {
        user.unlock();
    } else {
        var res = forms.accountLockDialog.showDialog('Lock User Account');
        if (res) {
            user.lock(res.reason, res.duration);
        }
    }
    refreshUserInfo();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"D4BFA73C-6618-4645-B967-75D99619D9F2"}
 */
function onActionDelete(event) {
    if (!tenant_name || !user_name) {
        return;
    }
    var tenant = scopes.svySecurity.getTenant(tenant_name);
    if (!tenant) {
        return;
    }
    var btnDelete = 'Delete';
    var btnCancel = 'Cancel';
    var res = plugins.dialogs.showWarningDialog('Confirm Delete', utils.stringFormat('You are about to delete the account for user "%1$s" from tenant "%2$s".<br>There is no undo for this operation.<br>Do you want to continue?', [user_name, tenant_name]), btnCancel, btnDelete);
    if (res == btnDelete) {
        res = tenant.deleteUser(user_name);
        if (res) {
            forms.tenantUsersList.show(m_TenantName);
        } else {
            plugins.dialogs.showWarningDialog('Delete Not Successful', 'Could not delete user.');
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
 * @properties={typeid:24,uuid:"0FC75D64-796F-45B0-8D69-5DFCFE264C69"}
 */
function onActionShowAllSessions(event) {
    if (tenant_name && user_name) {
        forms.sessionsList.showUserSessions(tenant_name, user_name);
    }
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"B8DD1495-F4DB-48EE-A01B-E5567D8D5A7E"}
 * @AllowToRunInFind
 */
function onActionResetPassword(event) {
    if (!user_name || !tenant_name) {
        return;
    }

    var user = scopes.svySecurity.getUser(user_name, tenant_name);
    if (!user) {
        return;
    }

    var resetBtn = 'Reset';
    if (resetBtn != plugins.dialogs.showWarningDialog('Confirm password reset',utils.stringFormat('Do you want to reset the password for user <b>"%1$s"</b> from tenant <b>"%2$s"</b> with a new auto-generated password?', [user_name, tenant_name]), 'Cancel', resetBtn)){
        return;
    }
    
    var newPwd = '';
    while (!newPwd || (newPwd.search(/[\/\+]/) != -1)) {
        newPwd = utils.stringMD5HashBase64(application.getUUID().toString()).substr(2, 8);
    }
    user.setPassword(newPwd);
    plugins.dialogs.showInfoDialog('User password has been reset', utils.stringFormat('The password for user <b>"%1$s"</b> from tenant <b>"%2$s"</b> has been reset.<br>The new auto-generated password is:<br><br><b>%3$s</b><br><br>Provide the new password to the user.', [user_name, tenant_name, newPwd]));
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"FCB90A0D-1B7A-4495-AEE0-6F913E59B08D"}
 */
function onActionShowActiveSessions(event) {
    if (tenant_name && user_name) {
        forms.sessionsList.showUserActiveSessions(tenant_name, user_name);
    }
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"6DFA0254-EAF1-46C8-9FCF-2685FF61176D"}
 */
function onActionTenantUsersList(event) {
    if (tenant_name && user_name) {
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
 * @properties={typeid:24,uuid:"471E17BA-9C30-450D-B13F-FB3A3F06C7FD"}
 */
function onActionViewRoles(event) {
    forms.userRoles.show(foundset);
}
