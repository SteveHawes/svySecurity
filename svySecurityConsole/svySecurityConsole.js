/**
 * @public 
 * @return {Number}
 * @properties={typeid:24,uuid:"83E1C40D-6EB5-4168-8ABD-A32BF2053776"}
 */
function getTenantCount() {
	var q = datasources.db.svy_security.tenants.createSelect();
	q.result.add(q.columns.tenant_name.count);
	var ds = databaseManager.getDataSetByQuery(q,1);
	var ex = ds.getException();
	if(ex){
		scopes.svySecurityConsoleHelper.logException('getTenantCount', ex);
		return 0;
	}
	return ds.getValue(1,1);
}

/**
 * Callback method for when an error occurred (the error can be a JavaScript or Servoy Java error).
 * @private 
 * @param ex exception to handle
 * @return {Boolean}
 *
 * @properties={typeid:24,uuid:"DE6CA807-A495-4536-87C4-A4A23428687E"}
 */
function onError(ex) {
    var exceptionText = scopes.svySecurityConsoleHelper.getExceptionText(ex); 
    scopes.svySecurityConsoleHelper.logException('onError', ex);
    plugins.dialogs.showErrorDialog('Error', utils.stringFormat('The following error was encountered:<br>%1$s', [exceptionText]), 'OK');
    return true;
}

/**
 * @public 
 * @properties={typeid:24,uuid:"04B144AE-7E6B-4932-BB7B-8BA1A76C11DB"}
 */
function addNewTenant() {
    var name = plugins.dialogs.showInputDialog('Add New Tenant', 'Enter a name for the new tenant:');
    if(!name){
        return;
    }
    if(scopes.svySecurity.getTenant(name)){
        plugins.dialogs.showErrorDialog('Could Not Create Tenant', utils.stringFormat('The specified tenant name "%1$s" is already in use.', [name]));
        return;
    }
    var tenant = scopes.svySecurity.createTenant(name);
    if(!tenant){
        plugins.dialogs.showErrorDialog('Could not create tenant', 'There was an unknown error. Please check server logs.');
        return;
    }
    forms.tenantDetail.show(name);
}

/**
 * @public 
 * @properties={typeid:24,uuid:"8A614377-C588-477F-851F-064A6F0F501D"}
 */
function addNewUser(tenantName) {
    if (!tenantName) {
        return;
    }
    var userName = plugins.dialogs.showInputDialog(utils.stringFormat('Add new user for tenant "%1$s"', [tenantName]), 'Enter username for the new user:');
    if(!userName){
        return;
    }
    var tenant = scopes.svySecurity.getTenant(tenantName);
    if (!tenant) {
        plugins.dialogs.showErrorDialog('Could not create user', 'The specified tenant could not be found. Please check server logs.');
        return;
    }
    if(scopes.svySecurity.getUser(userName, tenantName)){
        plugins.dialogs.showErrorDialog('Could not create user', utils.stringFormat('The specified user name "%1$s" is already in use. The username must be unique for the tenant.', [userName]));
        return;
    }
    var user = tenant.createUser(userName);
    if(!user){
        plugins.dialogs.showErrorDialog('Could not create user', 'There was an unknown error. Please check server logs.');
        return;
    }
    forms.userDetail.show(userName, tenantName);
}

/**
 * Callback method for when solution is opened.
 * When deeplinking into solutions, the argument part of the deeplink url will be passed in as the first argument
 * All query parameters + the argument of the deeplink url will be passed in as the second argument
 * For more information on deeplinking, see the chapters on the different Clients in the Deployment Guide.
 * @private
 * @param {String} arg startup argument part of the deeplink url with which the Client was started
 * @param {Object<Array<String>>} queryParams all query parameters of the deeplink url with which the Client was started
 *
 * @properties={typeid:24,uuid:"A76E93DE-E1E1-4109-A42A-1EE271D75F2F"}
 */
function onSolutionOpen(arg, queryParams) {
    if (!security.isUserMemberOfGroup('Administrators')) {
        scopes.svySecurityConsoleHelper.logWarning(utils.stringFormat('Attempt to access the Security Management Console by unauthorized user [%1$s] from IP address [%2$s]',[security.getUserName(), application.getIPAddress()]));
        plugins.dialogs.showWarningDialog('Access Denied', 'You do not have permission to access this application.');
        security.logout();
    }
    databaseManager.setAutoSave(false);
    databaseManager.setCreateEmptyFormFoundsets();
}
