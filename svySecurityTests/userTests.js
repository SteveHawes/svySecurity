/**
 * @properties={typeid:24,uuid:"46F78A6F-3DE6-44BC-8E59-A20FC1CEA084"}
 */
function setUp() {
    scopes.sharedTestUtils.setUp();
}

/**
 * @properties={typeid:24,uuid:"8F60EB9D-523C-4B06-90C6-0EA8348CD635"}
 */
function tearDown() {
    scopes.sharedTestUtils.tearDown();
}

/**
 * @properties={typeid:24,uuid:"D5F7A3FD-4DC1-4703-BE54-6FEC4960AC42"}
 */
function testUsers() {
    var grpName1 = application.getUUID().toString();
    var grpName2 = application.getUUID().toString();
    var grpName3 = application.getUUID().toString();

    try {

        var mockupSecurity = scopes.sharedTestUtils.getMockupSecurity([grpName1, grpName2, grpName3], null, true);

        //faking here the built-in Servoy security
        //need to use this approach because Servoy unit tests do not support login/authentication with test security settings
        scopes.sharedTestUtils.setMockupSecurity(mockupSecurity);
        
        scopes.svySecurity.syncPermissions();

        var perm1 = scopes.svySecurity.getPermission(grpName1);
        var perm2 = scopes.svySecurity.getPermission(grpName2);
        var perm3 = scopes.svySecurity.getPermission(grpName3);
        var tenant = scopes.svySecurity.createTenant(application.getUUID().toString());
        var role1 = tenant.createRole(application.getUUID().toString());
        var role2 = tenant.createRole(application.getUUID().toString());
        role1.addPermission(perm1);
        role2.addPermission(perm2);
        role2.addPermission(perm3);
        var userName = application.getUUID().toString();
        var pwd = application.getUUID().toString();

        var user = tenant.createUser(userName);

        //test defaults
        jsunit.assertEquals('The user name should be set correctly', userName, user.getUserName());
        jsunit.assertEquals('The user display name should be set correctly', userName, user.getDisplayName());
        jsunit.assertFalse('The user should not be locked', user.isLocked());
        jsunit.assertNull('The user should not have lock reason', user.getLockReason());
        jsunit.assertNull('The user should not have lock expiration', user.getLockExpiration());
        jsunit.assertFalse('The user should not have password', user.checkPassword(pwd));
        
        scopes.sharedTestUtils.assertThrows(user.checkPassword,null,null,'user.checkPassword should fail if required param is not provided');
        
        //test changing the display name
        var newDisplayName = application.getUUID().toString();
        var u = user.setDisplayName(newDisplayName);
        jsunit.assertSame('The call-chaining return value should be correct',user, u);
        jsunit.assertEquals('The user display name should be set correctly', newDisplayName, user.getDisplayName());
        
        //test changing the password
        scopes.sharedTestUtils.assertThrows(user.setPassword,null,null,'user.setPassword should fail if required param is not provided');
        u = user.setPassword(pwd);
        jsunit.assertTrue('The password should be set', user.checkPassword(pwd));

        //test user tenant
        var t = user.getTenant();
        jsunit.assertEquals('The correct tenant should be returned', tenant.getName(), t.getName());
        jsunit.assertEquals('The permissions should be an empty array',0, user.getPermissions().length);
        jsunit.assertEquals('The roles should be an empty array',0, user.getRoles().length);
        
        scopes.sharedTestUtils.assertThrows(user.addRole,null,null,'user.addRole should fail if required param is not provided');
        scopes.sharedTestUtils.assertThrows(user.removeRole,null,null,'user.removeRole should fail if required param is not provided');
        scopes.sharedTestUtils.assertThrows(user.hasRole,null,null,'user.hasRole should fail if required param is not provided');
        scopes.sharedTestUtils.assertThrows(user.hasPermission,null,null,'user.hasPermission should fail if required param is not provided');
        
        //test adding role by string
        u = user.addRole(role1.getName());
        jsunit.assertSame('The call-chaining return value should be correct',user, u);
        jsunit.assertTrue('The user should be added to the role', user.hasRole(role1.getName()));
        jsunit.assertTrue('The user should be added to the role', user.hasRole(role1));
        jsunit.assertTrue('The correct permission should be granted to the user',user.hasPermission(perm1.getName()));
        jsunit.assertTrue('The correct permission should be granted to the user',user.hasPermission(perm1));
        jsunit.assertFalse('Only the correct permission should be granted to the user',user.hasPermission(perm2));
        
        //test adding role by obj
        u = user.addRole(role2);
        jsunit.assertSame('The call-chaining return value should be correct',user, u);
        jsunit.assertTrue('The user should be added to the role', user.hasRole(role2.getName()));
        jsunit.assertTrue('The user should be added to the role', user.hasRole(role2));
        jsunit.assertTrue('The correct permission should be granted to the user',user.hasPermission(perm2));
        jsunit.assertTrue('The correct permission should be granted to the user',user.hasPermission(perm3));
        
        //nothing should happen trying to add the user to the same role twice
        user.addRole(role2)
        
        jsunit.assertEquals('The user should be member of 2 roles', 2, user.getRoles().length);
        jsunit.assertEquals('The user have 3 permissions', 3, user.getPermissions().length);
                
        //test removing permission by string
        u = user.removeRole(role1.getName());
        jsunit.assertSame('The call-chaining return value should be correct',user, u);
        jsunit.assertFalse('The user should be removed from the role', user.hasRole(role1.getName()));
        jsunit.assertFalse('The user should be removed from the role', user.hasRole(role1));
        jsunit.assertFalse('The correct permission should be removed from the user', user.hasPermission(perm1));
        jsunit.assertTrue('Only the correct permission should be removed from the user', user.hasPermission(perm2));
        jsunit.assertTrue('Only the correct permission should be removed from the user', user.hasPermission(perm3));
        
        //test removing permission by obj
        u = user.removeRole(role2);
        jsunit.assertSame('The call-chaining return value should be correct',user,u);
        jsunit.assertFalse('The user should be removed from the role', user.hasRole(role2.getName()));
        jsunit.assertFalse('The user should be removed from the role', user.hasRole(role2));
        
        jsunit.assertEquals('The user should have no roles', 0, user.getRoles().length);
        jsunit.assertEquals('The user should have no permissions', 0, user.getPermissions().length);
        
        u = user.lock();
        jsunit.assertSame('The call-chaining return value should be correct',user, u);
        jsunit.assertTrue('User should be locked',user.isLocked());
        jsunit.assertNull('The lock reason should remain null',user.getLockReason());
        jsunit.assertNull('The lock expiration should remain null',user.getLockExpiration());
        
        var reason = 'some reason';
        user.lock(reason);
        jsunit.assertTrue('User should be locked',user.isLocked());
        jsunit.assertEquals('The lock reason should be set',reason, user.getLockReason());
        jsunit.assertNull('The lock expiration should remain null',user.getLockExpiration());
        
        user.lock(reason, 10000000);
        jsunit.assertTrue('User should be locked',user.isLocked());
        jsunit.assertEquals('The lock reason should be set',reason, user.getLockReason());
        jsunit.assertNotNull('The lock expiration should be set',user.getLockExpiration());
        
        u = user.unlock();
        jsunit.assertSame('The call-chaining return value should be correct',user, u);
        jsunit.assertFalse('User should be unlocked',user.isLocked());
        jsunit.assertNull('The lock reason should be cleared',user.getLockReason());
        jsunit.assertNull('The lock expiration should be cleared',user.getLockExpiration());
        
        //test propagation of tenant lock
        tenant.lock(reason, 10000000);
        jsunit.assertTrue('User should be seen as locked',user.isLocked());
        jsunit.assertNull('The lock reason should be null',user.getLockReason());
        jsunit.assertNull('The lock expiration should be null',user.getLockExpiration());
        
        tenant.unlock();
        jsunit.assertFalse('User should be unlocked',user.isLocked());
        
        tenant.lock();
        user.lock();
        jsunit.assertTrue('User should be locked',user.isLocked());
        
        tenant.unlock();
        jsunit.assertTrue('User should be remain locked after being explicitly locked', user.isLocked());
        
        user.unlock();
        jsunit.assertFalse('User should be unlocked', user.isLocked());
        
        var sessions = user.getActiveSessions();
        jsunit.assertEquals('Active sessions should be empty array', 0, sessions.length);
        jsunit.assertEquals('Session count should be 0', 0, user.getSessionCount());
                
        
        //need to add at least 1 permission for the user otherwise login will not be successful
        user.addRole(role1);
        scopes.svySecurity.login(user);
        sessions = user.getActiveSessions();
        jsunit.assertEquals('Active sessions should be 1', 1, sessions.length);
        jsunit.assertEquals('Session count should be 1', 1, user.getSessionCount());
        
        scopes.svySecurity.logout();
        sessions = user.getActiveSessions();
        jsunit.assertEquals('Active sessions should be 0', 0, sessions.length);
        jsunit.assertEquals('Session count should remain 1', 1, user.getSessionCount());

    } finally {
        scopes.sharedTestUtils.restoreServoySecurity();
    }
}