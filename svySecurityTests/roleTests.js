/**
 * @properties={typeid:24,uuid:"4E6DFF45-F2BE-4DFC-AA9E-581BCB191CBE"}
 */
function setUp() {
    scopes.sharedTestUtils.setUp();
}

/**
 * @properties={typeid:24,uuid:"F7DAF6BE-F23C-47E0-897C-A17EE1D464D2"}
 */
function tearDown() {
    scopes.sharedTestUtils.tearDown();
}

/**
 * @properties={typeid:24,uuid:"EBD7BE35-9573-4CAB-B5AE-8A9C1C967350"}
 */
function testRole() {
    var grpName1 = application.getUUID().toString();
    var grpName2 = application.getUUID().toString();
    var grpName3 = application.getUUID().toString();

    try {

        var mockupSecurity = scopes.sharedTestUtils.getMockupSecurity([grpName1, grpName2, grpName3], null, true);

        //faking here the built-in Servoy security
        //need to use this approach because Servoy unit tests do not support login/authentication with test security settings
        scopes.sharedTestUtils.setMockupSecurity(mockupSecurity);
        
        scopes.svySecurity.syncPermissions();

        var tenant = scopes.svySecurity.createTenant(application.getUUID().toString());
        var tenant2 = scopes.svySecurity.createTenant(application.getUUID().toString());
        var roleName = application.getUUID().toString();
        var role = tenant.createRole(roleName);
        var user1 = tenant.createUser(application.getUUID().toString());
        var user2 = tenant.createUser(application.getUUID().toString());
        var perm1 = scopes.svySecurity.getPermission(grpName1);
        var perm2 = scopes.svySecurity.getPermission(grpName2);

        //test defaults
        jsunit.assertEquals('The role name should be set correctly', roleName, role.getName());
        jsunit.assertEquals('The role display name should be set correctly', roleName, role.getDisplayName());

        //test changing the display name
        var newDisplayName = application.getUUID().toString();
        role.setDisplayName(newDisplayName);
        jsunit.assertEquals('The role display name should be set correctly', newDisplayName, role.getDisplayName());

        var t = role.getTenant();
        jsunit.assertEquals('The correct tenant should be returned', tenant.getName(), t.getName());
        jsunit.assertEquals('The permissions should be an empty array',0, role.getPermissions().length);
        jsunit.assertEquals('The users should be an empty array',0, role.getUsers().length);
        
        scopes.sharedTestUtils.assertThrows(role.addPermission,null,null,'role.addPermission should fail if required param is not provided');
        scopes.sharedTestUtils.assertThrows(role.removePermission,null,null,'role.removePermission should fail if required param is not provided');
        scopes.sharedTestUtils.assertThrows(role.hasPermission,null,null,'role.hasPermission should fail if required param is not provided');
        
        //test adding permission by string
        var r = role.addPermission(grpName1);
        jsunit.assertSame('The call-chaining return value should be correct',role,r);
        jsunit.assertTrue('The permission should be granted to the role', role.hasPermission(grpName1));
        jsunit.assertTrue('The permission should be granted to the role', role.hasPermission(perm1));
        
        //test adding permission by obj
        r = role.addPermission(perm2);
        jsunit.assertSame('The call-chaining return value should be correct',role,r);
        jsunit.assertTrue('The permission should be granted to the role', role.hasPermission(grpName2));
        jsunit.assertTrue('The permission should be granted to the role', role.hasPermission(perm2));
        
        //nothing should happen trying to add the same permission twice
        role.addPermission(perm2);
        
        jsunit.assertEquals('The role should have 2 permissions', 2, role.getPermissions().length);
                
        //test removing permission by string
        r = role.removePermission(grpName1);
        jsunit.assertSame('The call-chaining return value should be correct',role,r);
        jsunit.assertFalse('The permission should be removed from the role', role.hasPermission(grpName1));
        jsunit.assertFalse('The permission should be removed from the role', role.hasPermission(perm1));
        
        //test removing permission by obj
        r = role.removePermission(perm2);
        jsunit.assertSame('The call-chaining return value should be correct',role,r);
        jsunit.assertFalse('The permission should be removed from the role', role.hasPermission(grpName2));
        jsunit.assertFalse('The permission should be removed from the role', role.hasPermission(perm2));
        
        jsunit.assertEquals('The role should have no permissions', 0, role.getPermissions().length);
        
        //test role users
        scopes.sharedTestUtils.assertThrows(role.addUser,null,null,'role.addUser should fail if required param is not provided');
        scopes.sharedTestUtils.assertThrows(role.removeUser,null,null,'role.addUser should fail if required param is not provided');
        scopes.sharedTestUtils.assertThrows(role.hasUser,null,null,'role.hasUser should fail if required param is not provided');
        
        //test adding user by string
        r = role.addUser(user1.getUserName());
        jsunit.assertSame('The call-chaining return value should be correct',role,r);
        jsunit.assertTrue('The user should be added to the role', role.hasUser(user1.getUserName()));
        jsunit.assertTrue('The user should be added to the role', role.hasUser(user1));
        
        //test adding user by obj
        r = role.addUser(user2);
        jsunit.assertSame('The call-chaining return value should be correct',role,r);
        jsunit.assertTrue('The user should be added to the role', role.hasUser(user2.getUserName()));
        jsunit.assertTrue('The user should be added to the role', role.hasUser(user2));
        
        //nothing should happen trying to add the same user twice
        role.addUser(user2);
        
        jsunit.assertEquals('The role should have 2 users', 2, role.getUsers().length);
                
        //test removing users by string
        r = role.removeUser(user1.getUserName());
        jsunit.assertSame('The call-chaining return value should be correct',role,r);
        jsunit.assertFalse('The user should be removed from the role', role.hasUser(user1.getUserName()));
        jsunit.assertFalse('The user should be removed from the role', role.hasUser(user1));
        
        //test removing user by obj
        r = role.removeUser(user2);
        jsunit.assertSame('The call-chaining return value should be correct',role,r);
        jsunit.assertFalse('The user should be removed from the role', role.hasUser(user2.getUserName()));
        jsunit.assertFalse('The user should be removed from the role', role.hasUser(user2));
        
        jsunit.assertEquals('The role should have no users', 0, role.getUsers().length);

    } finally {
        scopes.sharedTestUtils.restoreServoySecurity();
    }
}
