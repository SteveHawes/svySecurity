/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"3F977317-6202-4737-AB9F-7A2DE1AAB250"}
 */
var searchText = '';

/**
 * @protected 
 * @return {Array<String>}
 * @properties={typeid:24,uuid:"8D5B2C12-4E37-4660-9B70-A58030227B50"}
 */
function getSearchProviders(){
	return [];
}

/**
 * @protected 
 * @return {String}
 * @properties={typeid:24,uuid:"12859F84-5E7B-497D-84AB-8E83FB6CB40E"}
 */
function getSearchText(){
    return searchText + '';
}

/**
 * @protected 
 * @properties={typeid:24,uuid:"E478A932-86D4-440B-86A4-8630D1EA0A52"}
 */
function onSearch(){
	var search = scopes.svySearch.createSimpleSearch(foundset);
	search.setSearchText(getSearchText());
	var providers = getSearchProviders();
	for(var i in providers){
		search.addSearchProvider(providers[i]);
	}
	search.loadRecords(foundset);
}

/**
 * @protected 
 * @param {String} searchTextStr
 *
 * @properties={typeid:24,uuid:"CD093920-3688-472F-99BF-3C1D7420AEA1"}
 */
function setSearchText(searchTextStr) {
    searchText = searchTextStr;
    onSearch();
}

/**
 * @protected 
 * @properties={typeid:24,uuid:"A25C24A7-4167-4649-AF5E-9C34C226B448"}
 */
function showAll(){
	setSearchText(null);
	onSearch();
}
/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"5DCB7BEE-DA63-4163-83B4-C7B6F2BDE5D4"}
 */
function onShow(firstShow, event) {
	showAll();
}

/**
 * Called when the mouse is clicked on a row/cell (foundset and column indexes are given) or.
 * when the ENTER key is used then only the selected foundset index is given
 * Use the record to exactly match where the user clicked on
 *
 * @param {Number} foundsetindex
 * @param {Number} [columnindex]
 * @param {JSRecord} [record]
 * @param {JSEvent} [event]
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"7551DD44-6DB7-4F85-B96C-A14D8949D1D9"}
 */
function onCellClick(foundsetindex, columnindex, record, event) {
	showDetail();
}

/**
 * @protected 
 * @properties={typeid:24,uuid:"A38C16DD-2902-4598-B249-982DA2E826B1"}
 */
function showDetail(){
	// override
}
