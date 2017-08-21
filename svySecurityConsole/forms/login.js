/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"8750B001-2D88-4E54-AB05-831F49413D82"}
 */
var m_Username = '';

/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"725FBD60-7BB2-4C56-AD3D-1169775F8798"}
 */
var m_Password = '';

/**
 * @private 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"9CF8B09B-1F2A-41BB-B095-9D28F4ED7BAA",variableType:4}
 */
var m_RememberMe = 1;

/**
 * Perform the element default action.
 * @private
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"1E9579D2-FDF5-42ED-8EBE-6EF03963D521"}
 */
function onActionSignIn(event) {
    hideError();
    
    if (!m_Username) {
        showError('Please, enter username.');
        elements.fldUsername.requestFocus();
        return;
    }
    
    if (!m_Password) {
        showError('Please, enter password.');        
        elements.fldPassword.requestFocus();
        return;
    }
    
    var userUID = security.getUserUID(m_Username);
    if (!userUID) {
        showError('Please, check the username and password and try again.');
        elements.fldUsername.requestFocus();
        return;
    }
    
    var ok = security.checkPassword(userUID,m_Password);
    if (!ok) {
        showError('Please, check the username and password and try again.');
        elements.fldUsername.requestFocus();
        return;
    }
    
    ok = security.isUserMemberOfGroup('Administrators',userUID);
    if (!ok) {
        m_Password = null;
        showError('The specified user does not have permission to access the application.');
        elements.fldUsername.requestFocus();
        return;
    }
    
    if (m_RememberMe) {
        scopes.svySecurityConsoleHelper.setLoginCookie(m_Username);
    }
    
    security.login(m_Username,userUID,['Administrators']);    
}

/**
 * @private
 * @param {String} msg
 *
 * @properties={typeid:24,uuid:"70A04C75-4C95-4559-B6B3-55AE730C98CE"}
 */
function showError(msg) {
    elements.lblErrorInfo.text = msg;
    elements.lblErrorInfo.visible = true;
}

/**
 * @private 
 * @properties={typeid:24,uuid:"FCF8ADB5-E384-455C-BC58-7120A50BD639"}
 */
function hideError(){
    elements.lblErrorInfo.text = '';
    elements.lblErrorInfo.visible = false;
}
/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"1F084B18-A3C1-4E12-B983-5A665EB01287"}
 */
function onShow(firstShow, event) {
    hideError();
    setHeaderText('Sign In Security Management Console');
    m_Username = scopes.svySecurityConsoleHelper.readLoginCookie();
    m_RememberMe = m_Username ? 1 : 0;
    if (m_Username) {
        elements.fldPassword.requestFocus();
    }
    else {
        elements.fldUsername.requestFocus();
    }
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"5F0A1757-AF91-4206-9CAF-BED6A55EAA61"}
 */
function onActionUsername(event) {
    if (m_Username) {
        if (m_Password) {
            onActionSignIn(event);
        }
        else {
            elements.fldPassword.requestFocus();
        }
    }
}

/**
 * Perform the element default action.
 * 
 * @param {JSEvent} event the event that triggered the action
 * @private 
 *
 * @properties={typeid:24,uuid:"F59FB871-9C28-49A7-9CB1-C9186F599695"}
 */
function onActionPassword(event) {
    onActionSignIn(event);
}
