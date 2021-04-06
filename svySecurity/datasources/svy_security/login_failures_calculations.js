/**
 * If this failure updated the lock expiration date then return the new expiration date/time
 *
 * @return {Date}
 *
 * @properties={type:93,typeid:36,uuid:"565B5FEA-F806-438D-8D03-CA2BD0E0E5FE"}
 */
function new_lock_expiry() {
	var result = null;
	if (lock_period === 0) {
		result = new Date(9999, 12, 31);
	} else if (lock_period > 0) {
		result = scopes.svyDateUtils.addMilliseconds(failure_date, lock_period);
	}
	return result;
}
