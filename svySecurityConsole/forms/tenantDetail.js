/**
 * @public 
 * @param {String} tenantName
 *
 * @properties={typeid:24,uuid:"437F313B-B560-4E88-8044-15E79104D941"}
 */
function show(tenantName){
	if(tenantName){
		if(!foundset.selectRecord(tenantName)){
			throw 'tenant not found'
		}
	}
	application.getWindow().show(this);
}