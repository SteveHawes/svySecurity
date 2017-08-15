/**
 * @properties={typeid:24,uuid:"CA824CAE-E660-4931-981C-1180E904F9EB"}
 */
function testPermissionRoles() {
    var grpName1 = application.getUUID().toString();
    var grpName2 = application.getUUID().toString();
    var grpName3 = application.getUUID().toString();
    var tenantName1 = application.getUUID().toString();
    var tenantName2 = application.getUUID().toString();
    var roleName1 = application.getUUID().toString();
    var roleName2 = application.getUUID().toString();
    var roleName3 = application.getUUID().toString();
    var roleName4 = application.getUUID().toString();
    var userName1 = application.getUUID().toString();
    var userName2 = application.getUUID().toString();
    var userName3 = application.getUUID().toString();
    var userName4 = application.getUUID().toString();

    var perm1 = scopes.svySecurity.getPermission(grpName1);
    jsunit.assertNull('Permission should not exist', perm1);

    try {

        var mockupSecurity = scopes.sharedTestUtils.getMockupSecurity([grpName1, grpName2, grpName3], null, true);

        //faking here the built-in Servoy security
        //need to use this approach because Servoy unit tests do not support login/authentication with test security settings
        scopes.sharedTestUtils.setMockupSecurity(mockupSecurity);

        scopes.svySecurity.syncPermissions();

        perm1 = scopes.svySecurity.getPermission(grpName1);
        jsunit.assertNotNull('syncPermissions should have added the new security group as permission', perm1);

        var perm2 = scopes.svySecurity.getPermission(grpName2);
        var perm3 = scopes.svySecurity.getPermission(grpName3);

        var tenant1 = scopes.svySecurity.createTenant(tenantName1);
        var role1 = tenant1.createRole(roleName1);
        var role2 = tenant1.createRole(roleName2);
        var user1 = tenant1.createUser(userName1);
        var user2 = tenant1.createUser(userName2);
        role1.addUser(user1);
        role2.addUser(user1);
        role2.addUser(user2);

        var tenant2 = scopes.svySecurity.createTenant(tenantName2);
        var role3 = tenant2.createRole(roleName3);
        var role4 = tenant2.createRole(roleName4);
        var user3 = tenant2.createUser(userName3);
        var user4 = tenant2.createUser(userName4);
        role3.addUser(user3);
        role4.addUser(user3);
        role4.addUser(user4);


        var res = perm1.getRoles();
        jsunit.assertNotNull('The roles should be an empty array', res);
        jsunit.assertEquals('The roles should be an empty array', 0, res.length);
        
        res = perm1.getUsers();
        jsunit.assertNotNull('The users should be an empty array', res);
        jsunit.assertEquals('The users should be an empty array', 0, res.length);

        //test adding role as obj (cannot add role by name/string because tenant is non-deterministic in such case)
        var p = perm1.addRole(role1);
        jsunit.assertSame('The call-chaining return value should be correct', perm1, p);
        jsunit.assertTrue('The permission should be granted to the role', role1.hasPermission(grpName1));
        jsunit.assertEquals('The permission should have 1 role', 1, perm1.getRoles().length);
        
        //adding the same role twice should not fail but should not change anything
        p = perm1.addRole(role1);
        jsunit.assertSame('The call-chaining return value should be correct', perm1, p);
        jsunit.assertTrue('The permission should be granted to the role', role1.hasPermission(grpName1));
        jsunit.assertEquals('The permission should still have just 1 role', 1, perm1.getRoles().length);

        perm1.addRole(role2);
        jsunit.assertTrue('The permission should be granted to the role', role2.hasPermission(grpName1));
        jsunit.assertEquals('The permission should have 2 roles', 2, perm1.getRoles().length);

        role3.addPermission(perm1);
        jsunit.assertTrue('The permission should be granted to the role', role3.hasPermission(grpName1));
        jsunit.assertEquals('The permission should have 3 roles', 3, perm1.getRoles().length);
        
        jsunit.assertTrue('Permission should have role', perm1.hasRole(role1));
        jsunit.assertTrue('Permission should have role', perm1.hasRole(roleName2));
        jsunit.assertTrue('Permission should have role', perm1.hasRole(roleName3));
        
        jsunit.assertEquals('The permission should have 3 users', 3, perm1.getUsers().length);
        
        //remove by  obj
        p = perm1.removeRole(role2);
        jsunit.assertSame('The call-chaining return value should be correct', perm1, p);
        jsunit.assertFalse('The permission should be removed from role', role2.hasPermission(grpName1));
        jsunit.assertEquals('The permission should have 2 roles left', 2, perm1.getRoles().length);
        jsunit.assertEquals('The permission should have 2 users left', 2, perm1.getUsers().length);
        
        //remove by  str
        p = perm1.removeRole(roleName3);
        jsunit.assertSame('The call-chaining return value should be correct', perm1, p);
        jsunit.assertFalse('The permission should be removed from role', role3.hasPermission(grpName1));
        jsunit.assertEquals('The permission should have 1 role left', 1, perm1.getRoles().length);
        jsunit.assertEquals('The permission should have 1 user left', 1, perm1.getUsers().length);
        
        //try to remove by role which does not have the permission - should be OK without error
        
        jsunit.assertFalse('The role should not have the permission', role4.hasPermission(perm1));
        p = perm1.removeRole(role4);
        jsunit.assertSame('The call-chaining return value should be correct', perm1, p);        
        jsunit.assertEquals('The permission should have 1 role left', 1, perm1.getRoles().length);
        jsunit.assertEquals('The permission should have 1 user left', 1, perm1.getUsers().length);
        
        scopes.sharedTestUtils.assertThrows(perm1.addRole, null, null, 'Permission.addRole should fail if required param is not provided');
        scopes.sharedTestUtils.assertThrows(perm1.hasRole, null, null, 'Permission.hasRole should fail if required param is not provided');
        

    } finally {
        //restore back the original Servoy security
        scopes.sharedTestUtils.restoreServoySecurity();
    }
}
