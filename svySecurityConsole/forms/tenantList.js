
/**
 *
 * @return {Array<String>}
 *
 * @properties={typeid:24,uuid:"8B0E5FBC-4790-4AA0-BB43-FC56BD8AF429"}
 */
function getSearchProviders() {
	return [
		'tenant_name',
		'display_name'
	];
}

/**
 * @properties={typeid:24,uuid:"B3862F8D-9943-4DD0-B594-AEC4AEAF5FC4"}
 */
function showDetail(){
	application.getWindow().show(forms.tenantDetail);
}