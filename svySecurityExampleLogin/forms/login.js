
/**
 * @protected 
 * @param {String} errorCode
 *
 * @properties={typeid:24,uuid:"9FE679B8-F575-4332-B809-521CBAC2D5F0"}
 */
function onLoginError(errorCode) {
	plugins.dialogs.showErrorDialog('Login Failed',errorCode);
}
