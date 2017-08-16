/**
 * @properties={type:4,typeid:36,uuid:"EA7F62A6-FA74-42D1-A450-B71FF66210E2"}
 */
function userCount()
{
	return scopes.svySecurity.getTenant(tenant_name).getUsers().length;
}
