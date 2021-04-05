/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"5E6ECF41-0AD1-4E02-8B24-9CAA3F074175"}
 */
var searchText = null;

/** 
 * @type {scopes.svyToolbarFilter.ListComponentFilterRenderer}
 *
 * @properties={typeid:35,uuid:"22002DD0-0D65-4B55-99A6-3F2637E48C29",variableType:-4}
 */
var toolbarFilter;


/**
 * Callback method when form is (re)loaded.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"585CAD2D-3CED-4246-A9D2-2777DCFE4A26"}
 */
function onLoad(event) {
	toolbarFilter = scopes.svyToolbarFilter.createFilterToolbar(elements.customlist, elements.loginFailures);
}

/**
 * @param {JSEvent} event
 * @param {string} dataTarget
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"21C81658-11A1-470C-8446-4BA40D7FC86C"}
 */
function onLblFilterAction(event, dataTarget) {
	toolbarFilter.showPopupFilterPicker(elements[event.getElementName()])
}

/**
 * Called when the mouse is clicked on a list entry.
 *
 * @param {object} entry
 * @param {number} index
 * @param {string} dataTarget
 * @param {JSEvent} event
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"FA899B14-C1C6-46AD-9FF7-4C867431D63A"}
 */
function onCustomlistClick(entry, index, dataTarget, event) {
	toolbarFilter.onClick(entry, index, dataTarget, event);
}

/**
 * @param {JSEvent} event
 *
 * @protected
 *
 * @AllowToRunInFind
 * 
 * @properties={typeid:24,uuid:"CA15730D-0028-4017-8113-89DC617822A1"}
 */
function onSearchTextAction(event) {
	toolbarFilter.setSearchText(searchText);
	toolbarFilter.search();
}
