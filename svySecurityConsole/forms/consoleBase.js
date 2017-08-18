
/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"71438FEA-B66A-4BA7-BC3D-CB6BE8102EE6"}
 */
function navHome(event) {
	forms.home.show();
}

/**
 * @protected 
 * @param {String} text
 *
 * @properties={typeid:24,uuid:"9A7430D7-3924-4110-90ED-FC34650241C4"}
 */
function setHeaderText(text) {
    if (!text) {
        text = 'Security Management Console';
    }
    elements.lblHeader.text = text;
}
