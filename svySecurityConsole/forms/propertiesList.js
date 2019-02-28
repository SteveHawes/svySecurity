/**
 * @override
 * @protected
 * @return {Array<String>}
 *
 * @properties={typeid:24,uuid:"B5E07B61-85D3-4197-A71D-F01D9560D891"}
 */
function getSearchProviders() {
    return ['property_namespace', 'property_type', 'display_name'];
}

/**
 * @public
 *
 * @properties={typeid:24,uuid:"2341B247-A782-45F3-BBF3-03EBFA99F2FC"}
 */
function show() {
    foundset.clear();
        
    if (!foundset.loadAllRecords()) {
        throw new Error('Cannot load properties list.');
    }
    
    application.getWindow().show(this);
}

/**
 * @override
 * @protected
 * @properties={typeid:24,uuid:"44CC0B5E-DCE4-4500-9632-CC0F14EB756B"}
 */
function showDetail() {
    if (property_uuid) {
        forms.propertyDetail.show(property_uuid);
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
 * @properties={typeid:24,uuid:"EF69BAB5-ACAB-46F8-844B-2F1224AAD7A9"}
 */
function onShow(firstShow, event) {
    _super.onShow(firstShow, event);
    setHeaderText('<span class="fa fa-key"></span> All Properties');
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"1C2A129F-5D25-4FA3-A5AC-BABFBAABA693"}
 */
function onActionCreateProperty(event) {
	forms.propertyNew.show();
}
