/**
 * Indicates if the user is locked and the lock has not yet expires
 * @return {Number} 1 if locked
 * @properties={type:4,typeid:36,uuid:"3BDC35CD-C056-4421-B9F5-092CB9E1D3FE"}
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
