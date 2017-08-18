/**
 * @override
 * @protected
 * @return {Array<String>}
 *
 * @properties={typeid:24,uuid:"9FD2172F-95BA-421F-8CA9-426346335000"}
 */
function getSearchProviders() {
    return ['tenant_name', 'user_name', 'display_name'];
}

/**
 * @public
 *
 * @properties={typeid:24,uuid:"2410E8C8-08A9-4871-ADAE-F7B8B3D33A0A"}
 */
function show() {
    foundset.clear();
        
    if (!foundset.loadAllRecords()) {
        throw new Error('Cannot load users list.');
    }
    
    application.getWindow().show(this);
}

/**
 * @override
 * @protected
 * @properties={typeid:24,uuid:"2883E8AD-E710-4FC6-8E4A-31D0258E62E7"}
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
 * @properties={typeid:24,uuid:"ACCFA5AA-BC06-4727-920D-BC3C8CEEEC7F"}
 */
function onShow(firstShow, event) {
    _super.onShow(firstShow, event);
    setHeaderText('<span class="fa fa-users"></span> All Users');
}