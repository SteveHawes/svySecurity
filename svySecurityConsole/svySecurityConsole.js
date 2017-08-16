
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
		// TODO Log
	}
	return ds.getValue(1,1);
}
