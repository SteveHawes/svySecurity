/**
 * @public 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"6659A5E4-6531-4B3A-8362-12689570902B"}
 */
var svySecConsole_TenantRoleFilter = null;

/**
 * @public 
 * @type {String}
 * @properties={typeid:35,uuid:"076174EB-B48F-40D3-A824-EA858C0D1764"}
 */
var svySecConsole_TenantFilter = null;

/**
 * @public 
 * @type {String}
 * @properties={typeid:35,uuid:"D8CA7469-78B7-400E-97A1-FF5D0743B1B5"}
 */
var svySecConsole_UserFilter = null;

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

/**
 * @public
 * @param {svychartjs-chart} chart
 * @properties={typeid:24,uuid:"D54407E3-A7ED-41F2-ACFD-0757B6168520"}
 */
function createChartTenantsWithMostUsers(chart){
    //get top 12 tenants with most users
    var qry = datasources.db.svy_security.users.createSelect();
    qry.result.add(qry.columns.tenant_name,'tenant');
    qry.result.add(qry.columns.user_name.count,'number_of_users');
    qry.groupBy.add(qry.columns.tenant_name);
    qry.sort.add(qry.columns.user_name.count.desc);
    var ds = databaseManager.getDataSetByQuery(qry,12);
    
    var data = {
        type: 'doughnut',
        data: {
            labels: ds.getColumnAsArray(1),
        datasets: [{
            data: ds.getColumnAsArray(2),
            backgroundColor: scopes.svySecurityConsoleHelper.getColors(ds.getMaxRowIndex())
            }]
        }
    };
    
    var options = {
        title: {
            display: true,
            text: 'Top 12 tenants with most users'
        },
        legend: {
            display: true,
            position: 'left'
        }
    };
    chart.setData(data);
    chart.setOptions(options);
}

/**
 * @public
 * @param {svychartjs-chart} chart
 * @properties={typeid:24,uuid:"DC5F022B-5F60-4D99-93C4-3A5345663B18"}
 */
function createChartTopTenantsUsageOverTimeMonths(chart){
    //get top 12 tenants with most usage for the last X months
    var maxTenants = 12;
    var monthsWindow = 6;
    var curDate = application.getServerTimeStamp();
    var cutOffDate = scopes.svyDateUtils.getFirstDayOfMonth(scopes.svyDateUtils.addMonths(curDate, (-1 * (monthsWindow - 1))));
    
    //get the top 12 tenants with max aggregate usage for the last 6 months
    var qryFilter = datasources.db.svy_security.sessions.createSelect();
    qryFilter.result.add(qryFilter.columns.tenant_name);
    qryFilter.where.add(qryFilter.columns.session_start.gt(cutOffDate));
    qryFilter.groupBy.add(qryFilter.columns.tenant_name);
    qryFilter.sort.add(qryFilter.columns.session_duration.sum.desc);
    var tenantsToInclude = databaseManager.getDataSetByQuery(qryFilter, maxTenants).getColumnAsArray(1);
    
    var yearMonths = new Array(monthsWindow); //will contain 20171, 20172,...201712
    var yearMonthsNames = new Array(monthsWindow); //will contain Jan, Feb, Mar....
    for (var index = 0; index < yearMonths.length; index++) {
        var dt = scopes.svyDateUtils.addMonths(cutOffDate, index);
        yearMonths[index] = utils.stringFormat('%1$.0f%2$.0f',[dt.getFullYear(), (dt.getMonth() + 1)]); /*month in JS is 0-11!*/
        yearMonthsNames[index] = utils.dateFormat(dt,'MMM');        
    }
    
    var qry = datasources.db.svy_security.sessions.createSelect();
    var yearMonthCol = qry.columns.session_start.year.cast(QUERY_COLUMN_TYPES.TYPE_STRING).concat(qry.columns.session_start.month.cast(QUERY_COLUMN_TYPES.TYPE_STRING)); 
    
    //select
    qry.result.add(qry.columns.tenant_name, 'tenant');    
    qry.result.add(yearMonthCol, 'yyyymm');
    qry.result.add(qry.columns.session_duration.sum.divide(3600000), 'usage_hours'); //session_duration is stored in milliseconds so we need to convert it to hours
    
    //group by
    qry.groupBy.add(qry.columns.tenant_name);
    qry.groupBy.add(yearMonthCol);
    
    //where
    qry.where.add(qry.columns.session_start.gt(cutOffDate));
    qry.where.add(qry.columns.tenant_name.isin(tenantsToInclude));
    
    //sort
    qry.sort.add(qry.columns.tenant_name.asc);
    qry.sort.add(yearMonthCol);
        
    var ds = databaseManager.getDataSetByQuery(qry, maxTenants * monthsWindow);
    
    var dsData = databaseManager.createEmptyDataSet();
    dsData.addColumn('tenant',1,JSColumn.TEXT);
    for (index = 0; index < yearMonths.length; index++) {
        dsData.addColumn(yearMonths[index].label, index+2, JSColumn.NUMBER);        
    }
    
    //initialize the dsData with tenant names and 0's for the value columns
    for (index = 0; index < tenantsToInclude.length; index++) {
        var rowData = new Array(monthsWindow + 1);
        rowData[0] = tenantsToInclude[index];
        for (var i = 0; i < monthsWindow; i++){
            rowData[i+1] = 0;
        }            
        dsData.addRow(rowData);
    }
    
    for (index = 1; index <= ds.getMaxRowIndex(); index++) {        
        var row = ds.getRowAsArray(index);
        var tenantIndx = tenantsToInclude.indexOf(row[0]);
        var valueIndx = yearMonths.indexOf(row[1]);
        var value = row[2];
        
        dsData.setValue(tenantIndx+1, valueIndx + 2, value);
    }
    
    var colors = scopes.svySecurityConsoleHelper.getColors(tenantsToInclude.length);
    var chartDatasets = [];
    for (index = 0; index < tenantsToInclude.length; index++) {
        chartDatasets.push({
            label: tenantsToInclude[index],
            fill: false,
            data: dsData.getRowAsArray(index+1).splice(1,monthsWindow),
            borderColor: colors[index],            
            pointBorderColor: colors[index],
            pointBackgroundColor: colors[index],
            pointBorderWidth: 1,
            pointHoverRadius: 3,
            pointHoverBackgroundColor: colors[index],
            pointHoverBorderColor: 'orange',
            pointHoverBorderWidth: 2,
            tension: 0.1
        });
    }
    
    var data = {
        type: 'line',
        data: {
            labels: yearMonthsNames,
            datasets: chartDatasets
        }
    };
    
    var options = {
        title: {
            display: true,
            text: utils.stringFormat('Usage for last %1$.0f months by tenant (top %2$.0f)', [monthsWindow, maxTenants])
        },
        legend: {
            display: true,
            position: 'bottom'
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Usage Hours'
                }
            }]
        }
    };
    
    chart.setData(data);
    chart.setOptions(options);
}

/**
 * @public
 * @param {String} tenantName
 * @param {svychartjs-chart} chart
 * @properties={typeid:24,uuid:"FAF8AB2A-F67F-427E-941A-E519963319D0"}
 */
function createChartTenantTopUsersUsageOverTimeMonths(tenantName, chart){
    //get top 12 users for the specified tenant with most usage for the last X months
    var maxUsers = 12;
    var monthsWindow = 6;
    var curDate = application.getServerTimeStamp();
    var cutOffDate = scopes.svyDateUtils.getFirstDayOfMonth(scopes.svyDateUtils.addMonths(curDate, (-1 * (monthsWindow - 1))));
    
    //get the top 12 users with max aggregate usage for the last 6 months
    var qryFilter = datasources.db.svy_security.sessions.createSelect();
    qryFilter.result.add(qryFilter.columns.user_name);
    qryFilter.where.add(qryFilter.columns.tenant_name.eq(tenantName));
    qryFilter.where.add(qryFilter.columns.session_start.gt(cutOffDate));
    qryFilter.groupBy.add(qryFilter.columns.user_name);
    qryFilter.sort.add(qryFilter.columns.session_duration.sum.desc);
    var usersToInclude = databaseManager.getDataSetByQuery(qryFilter, maxUsers).getColumnAsArray(1);
    
    var yearMonths = new Array(monthsWindow); //will contain 20171, 20172,...201712
    var yearMonthsNames = new Array(monthsWindow); //will contain Jan, Feb, Mar....
    for (var index = 0; index < yearMonths.length; index++) {
        var dt = scopes.svyDateUtils.addMonths(cutOffDate, index);
        yearMonths[index] = utils.stringFormat('%1$.0f%2$.0f',[dt.getFullYear(), (dt.getMonth() + 1)]); /*month in JS is 0-11!*/
        yearMonthsNames[index] = utils.dateFormat(dt,'MMM');        
    }
    
    var qry = datasources.db.svy_security.sessions.createSelect();
    var yearMonthCol = qry.columns.session_start.year.cast(QUERY_COLUMN_TYPES.TYPE_STRING).concat(qry.columns.session_start.month.cast(QUERY_COLUMN_TYPES.TYPE_STRING)); 
    
    //select
    qry.result.add(qry.columns.user_name, 'user');    
    qry.result.add(yearMonthCol, 'yyyymm');
    qry.result.add(qry.columns.session_duration.sum.divide(3600000), 'usage_hours'); //session_duration is stored in milliseconds so we need to convert it to hours
    
    //group by
    qry.groupBy.add(qry.columns.user_name);
    qry.groupBy.add(yearMonthCol);
    
    //where
    qry.where.add(qry.columns.session_start.gt(cutOffDate));
    qry.where.add(qry.columns.tenant_name.eq(tenantName));
    qry.where.add(qry.columns.user_name.isin(usersToInclude));
    
    //sort
    qry.sort.add(qry.columns.user_name.asc);
    qry.sort.add(yearMonthCol);
    
    var ds = databaseManager.getDataSetByQuery(qry, maxUsers * monthsWindow);
        
    var dsData = databaseManager.createEmptyDataSet();
    dsData.addColumn('user',1,JSColumn.TEXT);
    for (index = 0; index < yearMonths.length; index++) {
        dsData.addColumn(yearMonths[index].label, index+2, JSColumn.NUMBER);        
    }
    
    //initialize the dsData with user names and 0's for the value columns
    for (index = 0; index < usersToInclude.length; index++) {
        var rowData = new Array(monthsWindow + 1);
        rowData[0] = usersToInclude[index];
        for (var i = 0; i < monthsWindow; i++){
            rowData[i+1] = 0;
        }            
        dsData.addRow(rowData);
    }
    
    for (index = 1; index <= ds.getMaxRowIndex(); index++) {        
        var row = ds.getRowAsArray(index);
        var userIndx = usersToInclude.indexOf(row[0]);
        var valueIndx = yearMonths.indexOf(row[1]);
        var value = row[2];
        
        dsData.setValue(userIndx+1, valueIndx + 2, value);
    }
    
    var colors = scopes.svySecurityConsoleHelper.getColors(usersToInclude.length);
    var chartDatasets = [];
    for (index = 0; index < usersToInclude.length; index++) {
        chartDatasets.push({
            label: usersToInclude[index],
            fill: false,
            data: dsData.getRowAsArray(index+1).splice(1,monthsWindow),
            borderColor: colors[index],            
            pointBorderColor: colors[index],
            pointBackgroundColor: colors[index],
            pointBorderWidth: 1,
            pointHoverRadius: 3,
            pointHoverBackgroundColor: colors[index],
            pointHoverBorderColor: 'orange',
            pointHoverBorderWidth: 2,
            tension: 0.1
        });
    }
    
    var data = {
        type: 'line',
        data: {
            labels: yearMonthsNames,
            datasets: chartDatasets
        }
    };
    
    var options = {
        title: {
            display: true,
            text: utils.stringFormat('Usage for last %1$.0f months by users of tenant %2$s (top %3$.0f)', [monthsWindow, tenantName, maxUsers])
        },
        legend: {
            display: true,
            position: 'right'
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Usage Hours'
                }
            }]
        }
    };
    
    chart.setData(data);
    chart.setOptions(options);
}