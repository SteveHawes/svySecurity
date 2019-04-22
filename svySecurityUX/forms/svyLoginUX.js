/**
 * @protected 
 * @properties={typeid:24,uuid:"0F8EF383-C4EC-4F30-B0A5-08D28469C8D8"}
 * @override
 */
function onLoginSuccess() {
	elements.errorMsg.visible = false;
}

/**
 * @protected 
 * @param error
 *
 * @properties={typeid:24,uuid:"53BCBA3B-4338-44F0-8572-7DA218CE54A5"}
 * @override
 */
function onLoginError(error) {
	elements.errorMsg.text = error;
	elements.errorMsg.visible = true;
}