/**
 * @properties={type:12,typeid:36,uuid:"D9B2325E-71A2-450C-98A2-B60AC309F765"}
 */
function role_display_name()
{
    if (svy_sec_console_user_roles_to_roles) {
        return svy_sec_console_user_roles_to_roles.display_name;
    }
    return role_name;
}

/**
 * @properties={type:12,typeid:36,uuid:"888B529B-8DF6-4B21-97E8-9B016A431692"}
 */
function user_display_name()
{
	if (svy_sec_console_user_roles_to_users) {
	    return svy_sec_console_user_roles_to_users.display_name;
	}
	return user_name;
}
