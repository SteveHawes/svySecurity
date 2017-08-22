/**
 * @protected 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"6CCDD05F-0BEC-456C-AE21-34E0CC8ABF86",variableType:4}
 */
var m_LockDurationMinutes = null;

/**
 * @protected 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"227A33EA-5798-48DB-AD82-BA5C056FBEEE"}
 */
var m_LockReason = null;

/**
 * @private 
 * @type {Boolean}
 * @properties={typeid:35,uuid:"D519BBB8-1768-4A48-89B7-B4E831FEEEFA",variableType:-4}
 */
var m_IsCanceled = true;

/**
 * @public 
 * @param {String} titleText
 * @return {{reason: String, duration: Number}}
 * @properties={typeid:24,uuid:"F4654E0B-BDF6-42C2-9151-1F7199742FC6"}
 */
function showDialog(titleText){
    m_LockReason = null;
    m_LockDurationMinutes = null;
    m_IsCanceled = true;
    var win = application.createWindow(controller.getName(), JSWindow.MODAL_DIALOG, application.getWindow());
    win.title = titleText;
    controller.show(win);
    if (m_IsCanceled) {
        return null;
    }
    
    return {reason: m_LockReason, duration: m_LockDurationMinutes ? m_LockDurationMinutes * 60000 : null};
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"F1D74EAA-5219-4F86-BD63-621C0A9265AC"}
 */
function onActionCancel(event) {
    m_IsCanceled = true;
    controller.getWindow().hide();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"A75DBCBE-D228-4191-BF4E-26BCA0CC6349"}
 */
function onActionLock(event) {
    m_IsCanceled = false;
    controller.getWindow().hide();
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"1B8EC592-0ED2-4294-867B-F5C232E2A7DE"}
 */
function onShow(firstShow, event) {
    elements.fldLockReason.requestFocus();
}
