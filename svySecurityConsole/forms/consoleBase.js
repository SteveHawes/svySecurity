
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
	nav(forms.home);
}

/**
 * @protected 
 * @param {RuntimeForm} form
 *
 * @properties={typeid:24,uuid:"5D5F3601-EA89-4993-A7F7-9CCB3AE90B41"}
 */
function nav(form){
	application.getWindow().show(form);
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
