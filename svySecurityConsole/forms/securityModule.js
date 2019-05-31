/**
 * @public 
 * @param {String} formName
 *
 * @properties={typeid:24,uuid:"48779F7C-48EB-4A14-AE71-906F5DDDCE45"}
 */
function show(formName) {
	elements.tabless.removeAllTabs();
	elements.tabless.addTab(formName);
	application.getWindow().show(controller.getName())
}