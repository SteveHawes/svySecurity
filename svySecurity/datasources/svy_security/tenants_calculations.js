/**
 * Indicates if the tenant is locked and the lock has not yet expires
 * @return {Number} 1 if locked
 * @properties={type:4,typeid:36,uuid:"90982FF7-E90F-4F1C-BABC-658D968FDD62"}
 */
function is_locked()
{
	if(lock_flag == 1){
		if(lock_expiration){
			var now = new Date();
			return now < lock_expiration;
		}
		return true;
	}
	return false;
}
