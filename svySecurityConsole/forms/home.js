/**
 * @protected 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"EA6EFC2C-B5A7-4C47-AE38-1D39E085B714",variableType:4}
 */
var m_TenantCount = 0;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"400BAABE-752A-4016-978A-F5F7956FB127",variableType:4}
 */
var m_UserCount = 0;

/**
 * @protected 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"F815E0A0-23A6-4F2F-B636-2DBEA5E660BC",variableType:4}
 */
var m_SessionCount = 0;

/**
 * @type {Date}
 *
 * @properties={typeid:35,uuid:"8003CA54-5B5F-4C9B-8F7A-055DCCDA6216",variableType:93}
 */
var m_LastRefreshDate = new Date();

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"5DD18883-576C-4C57-BDD3-93A198767DD4"}
 */
function addTenant(event) {
	scopes.svySecurityConsole.addNewTenant();
}

/**
 * @public
 * @properties={typeid:24,uuid:"D0EE65D0-4348-4617-8090-C9F02EBE3AF1"}
 */
function show(){
    application.getWindow().show(this);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"17628FA9-EFC8-4091-BFE4-637266BF5B3B"}
 */
function navTenantList(event) {
	forms.tenantList.show();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"86AD6257-8074-42FF-A15D-36470AAEAD19"}
 */
function navUserList(event) {
	forms.usersList.show();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"F1FDDFCE-8198-4C86-AEBA-691980ADA70D"}
 */
function navSessionList(event) {
	forms.sessionsList.showAllActiveSessions();
}

/**
 * @private 
 * @properties={typeid:24,uuid:"1B00F1D6-9303-4988-8962-8125A010B5CB"}
 */
function updateTenantCount(){
	var q = datasources.db.svy_security.tenants.createSelect();
	q.result.add(q.columns.tenant_name.count);
	m_TenantCount = databaseManager.getDataSetByQuery(q,1).getValue(1,1);
}

/**
 * @private 
 * @properties={typeid:24,uuid:"B4FC6F5D-1E1B-4746-AFC6-748D5F6D7BBD"}
 */
function updateUserCount(){
	var q = datasources.db.svy_security.users.createSelect();
	q.result.add(q.columns.user_name.count);
	m_UserCount = databaseManager.getDataSetByQuery(q,1).getValue(1,1);
}

/**
 * @private
 * @properties={typeid:24,uuid:"27EDBB2B-55C6-4F4E-847A-D8E8E6286523"}
 */
function updateSessionCount(){
	var timeout = 30 * 60 * 1000; // 30 minutes
	var expiration = new Date();
	expiration.setTime(expiration.getTime() - timeout);
	var q = datasources.db.svy_security.sessions.createSelect();
	q.result.add(q.columns.id.count);
	q.where
		.add(q.columns.session_end.isNull)
		.add(q.columns.last_client_ping.gt(expiration))
	m_SessionCount = databaseManager.getDataSetByQuery(q,1).getValue(1,1);
}

/**
 * @private 
 * @properties={typeid:24,uuid:"043B4DF5-1736-4A87-B690-850F01BBAC39"}
 */
function updateKPIs(){
	updateSessionCount();
	updateTenantCount();
	updateUserCount();
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"20C5B324-C613-46C3-96F4-5BEF04705FD5"}
 */
function onShow(firstShow, event) {
    setHeaderText('<span class="fa fa-home"></span> Security Management Console');
	refreshInfo();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"33C61AE7-7207-4F23-8310-784DF7A7F394"}
 */
function onActionRefresh(event) {
    refreshInfo();
}

/**
 * @private 
 * @properties={typeid:24,uuid:"4877EE0E-D50E-4FE4-B9FD-C90EB7CD4E24"}
 */
function refreshInfo() {
    m_LastRefreshDate = new Date();
    updateKPIs();
    refreshLeftChart();
    refreshRightChart();
}

/**
 * @private
 * @properties={typeid:24,uuid:"1C1E3136-4785-498A-AE8D-FB5B97B9706A"}
 */
function refreshLeftChart(){
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
        }
    };
    elements.chartLeft.setData(data);
    elements.chartLeft.setOptions(options);
}

/**
 * @private
 * @properties={typeid:24,uuid:"1DE56846-EFA3-4C42-B2E4-8F824E5BFAE9"}
 */
function refreshRightChart(){
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
    
    var yearMonths = new Array(monthsWindow); //will contain 201701, 201702,...
    var yearMonthsNames = new Array(monthsWindow); //will contain Jan, Feb, Mar....
    for (var index = 0; index < yearMonths.length; index++) {
        var dt = scopes.svyDateUtils.addMonths(cutOffDate, index);
        yearMonths[index] = (dt.getFullYear() * 100) + (dt.getMonth() + 1); /*month in JS is 0-11!*/
        yearMonthsNames[index] = utils.dateFormat(dt,'MMM');        
    }
    
    var qry = datasources.db.svy_security.sessions.createSelect();
    var yearMonthCol = qry.columns.session_start.year.multiply(100).plus(qry.columns.session_start.month).cast(QUERY_COLUMN_TYPES.TYPE_INTEGER); 
    
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
    
    //TODO: there appears to be a Servoy bug - see https://support.servoy.com/browse/SVY-11480
    //var ds = databaseManager.getDataSetByQuery(qry, maxTenants * monthsWindow);
    
    //until the bug is resolved we simply pass the raw generated SQL (with slight modification because cannot pass array value as parameter to SQL for "...tenant_name in ?...")
    //NOTE: the hardcoded SQL below is for PostgreSQL only!
    var rawSql = 'select sessions.tenant_name as tenant, cast(((extract(year from sessions.session_start)*100)+extract(month from sessions.session_start)) as int4) as yyyymm, (sum(sessions.session_duration)/3600000) as usage_hours from sessions sessions where sessions.session_start > ? group by  sessions.tenant_name ,  cast(((extract(year from sessions.session_start)*100)+extract(month from sessions.session_start)) as int4) order by sessions.tenant_name asc, cast(((extract(year from sessions.session_start)*100)+extract(month from sessions.session_start)) as int4) asc';
    var ds = databaseManager.getDataSetByQuery('svy_security', rawSql, [cutOffDate], maxTenants * monthsWindow);
    
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
            display: false
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
    elements.chartRight.setData(data);
    elements.chartRight.setOptions(options);
}