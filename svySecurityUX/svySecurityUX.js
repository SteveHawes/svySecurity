/**
 * @protected 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"D6F5F1DC-BC84-498F-AC55-052D81412FC2"}
 */
var UX_SELECTED_ROLE;

/**
 * @protected 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"94E8C198-E977-42B3-8F5F-2DA2B5531DA6"}
 */
var UX_SELECTED_USER;

/**
 * @public 
 * @properties={typeid:35,uuid:"532F2267-1C2C-4ABE-A317-958EF92DDFFA",variableType:-4}
 */
var SVY_SECURITY_UX = {
	TENANT: "svySecurityUXTenant",
	TENANT_ROLES: "svySecurityUXTenantRolesContainer",
	TENANT_USERS: "svySecurityUXTenantUsersContainer",
	USER: "svySecurityUXUser"
}


/**
 * @protected  
 * @enum 
 * @properties={typeid:35,uuid:"D76A9E1A-D611-464F-AB6D-01B4B7540D4E",variableType:-4}
 */
var SVY_SECURITY_EVENTS = {
	AFTER_USER_CREATE: 'after-user-create'
};

/**
 * This function should be used only by svySecurityUX module, do not call this function
 * @protected 
 * @param {String} roleName
 *
 * @properties={typeid:24,uuid:"C572C7BE-70FF-463D-AF50-11EDA5AB2F82"}
 */
function setSelectedRole(roleName) {
	UX_SELECTED_ROLE = roleName;
}

/**
 * This function should be used only by svySecurityUX module, do not call this function
 * @protected 
 * @param {String} userName
 *
 * @properties={typeid:24,uuid:"1712A6B6-CA27-4839-A202-E34DA2E7A668"}
 */
function setSelectedUser(userName) {
	UX_SELECTED_USER = userName;
}

/**
 * Execute the onAfterUserCreateEvent every time a User is created using the svySecurityUX console.
 * Allow the developer to perform additional action whenever an user is created, as sending an email to the user
 * 
 * @param {Function} onAfterUserCreateEvent
 * @public
 *
 * @properties={typeid:24,uuid:"8DF58EF7-640D-40C8-B816-BF1B8701A15B"}
 */
function addAfterUserCreateListener(onAfterUserCreateEvent) {
	scopes.svyEventManager.addListener(SVY_SECURITY_EVENTS.AFTER_USER_CREATE, SVY_SECURITY_EVENTS.AFTER_USER_CREATE, onAfterUserCreateEvent);
}


/**
 * @param {Function} onAfterUserCreateEvent
 * @public 
 *
 * @properties={typeid:24,uuid:"263D877C-1C9C-434B-B90B-BFA6FF39766D"}
 */
function removeAfterUserCreateListener(onAfterUserCreateEvent) {
	scopes.svyEventManager.removeListener(SVY_SECURITY_EVENTS.AFTER_USER_CREATE, SVY_SECURITY_EVENTS.AFTER_USER_CREATE, onAfterUserCreateEvent);
}


/**
 * DO NOT CALL THIS FUNCTION
 * @public 
 * @param {String} userName
 * @param {String} tenantName
 *
 * @properties={typeid:24,uuid:"0F18B47F-4F41-44C1-A94D-7C6FC9DD675C"}
 */
function triggerAfterUserCreate(userName, tenantName) {
	scopes.svyEventManager.fireEvent(SVY_SECURITY_EVENTS.AFTER_USER_CREATE, SVY_SECURITY_EVENTS.AFTER_USER_CREATE, [userName, tenantName]);
}
