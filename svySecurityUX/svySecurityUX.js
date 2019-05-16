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
	TENANT_USERS: "svySecurityUXTenantUsersContainer"
}

/**
 * @protected 
 * @param {String} roleName
 *
 * @properties={typeid:24,uuid:"C572C7BE-70FF-463D-AF50-11EDA5AB2F82"}
 */
function setSelectedRole(roleName) {
	UX_SELECTED_ROLE = roleName;
}

/**
 * @protected 
 * @param {String} userName
 *
 * @properties={typeid:24,uuid:"1712A6B6-CA27-4839-A202-E34DA2E7A668"}
 */
function setSelectedUser(userName) {
	UX_SELECTED_USER = userName;
}