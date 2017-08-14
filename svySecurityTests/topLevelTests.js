/**
 * @properties={typeid:24,uuid:"827314D4-D66D-438E-B2CF-D256456A1F74"}
 */
function setUp() {
    scopes.sharedTestUtils.setUp();
}

/**
 * @properties={typeid:24,uuid:"E8912F18-F70E-49AC-BD02-8BA67F31CD8A"}
 */
function tearDown() {
    scopes.sharedTestUtils.tearDown();
}

/**
 * @properties={typeid:24,uuid:"4DE2808D-C748-48AC-9B00-5B1FA5EF17B1"}
 */
function testCreateTenant() {
    scopes.sharedTestUtils.assertThrows(function() {
            scopes.svySecurity.createTenant();
        }, null, null, 'Should fail if required param not provided to createTenant');

    var tenantName = application.getUUID().toString();
    var tenant = scopes.svySecurity.createTenant(tenantName);
    jsunit.assertNotNull('Tenant should be created', tenant);
    jsunit.assertEquals('Tenant name should be set', tenantName, tenant.getName());
    jsunit.assertEquals('Tenant display name should be same as name initially', tenantName, tenant.getDisplayName());

    scopes.sharedTestUtils.assertThrows(function() {
            scopes.svySecurity.createTenant(tenantName);
        }, null, null, 'Should fail when trying to create tenant with duplicate name');

    var tenant2 = scopes.svySecurity.createTenant(tenantName + '-2');
    jsunit.assertNotNull('Should be able to create multiple tenants', tenant2);
}

/**
 * @properties={typeid:24,uuid:"20843304-3C84-489C-B624-ED9C3FDEE80A"}
 */
function testSyncPermissions() {
    var grpName = application.getUUID().toString();
    var perm = scopes.svySecurity.getPermission(grpName);
    jsunit.assertNull('Permission should not exist', perm);

    try {

        var mockupSecurity = scopes.sharedTestUtils.getMockupSecurity([grpName], null, true);

        //faking here the built-in Servoy security
        //need to use this approach because Servoy unit tests do not support login/authentication with test security settings
        scopes.sharedTestUtils.setMockupSecurity(mockupSecurity);

        scopes.svySecurity.syncPermissions();
        perm = scopes.svySecurity.getPermission(grpName);
        jsunit.assertNotNull('syncPermissions should have added the new security group as permission', perm);

        //this will simulate "deleting" of a security group as getGroups will return the original dataset
        mockupSecurity = scopes.sharedTestUtils.getMockupSecurity(null, null, true);
        scopes.sharedTestUtils.setMockupSecurity(mockupSecurity);

        scopes.svySecurity.syncPermissions();
        perm = scopes.svySecurity.getPermission(grpName);
        jsunit.assertNotNull('syncPermissions should not delete existing permission records', perm);
    } finally {
        //restore back the original Servoy security
        scopes.sharedTestUtils.restoreServoySecurity();
    }
}

/**
 * Testing login, logout and session initialization and closing
 * @properties={typeid:24,uuid:"5B7F3651-E5CC-49FB-9E56-3CDB64E15AA2"}
 */
function testLogin() {
    var testTenantName = application.getUUID().toString();
    var testRoleName = application.getUUID().toString();
    var testUserName = application.getUUID().toString();
    var testPermissionName = application.getUUID().toString();
    
    //initially the mockup security will fake an existing servoy user session/login
    var mockupSecurity = scopes.sharedTestUtils.getMockupSecurity([testPermissionName], testUserName, false);
    var servoySecurityLoginCalled = false;
    mockupSecurity.login = function() {
        servoySecurityLoginCalled = true;
        //simulating failure of security.login
        return false;
    };
    
    
    try {
        scopes.sharedTestUtils.setMockupSecurity(mockupSecurity);
        var tenant = scopes.svySecurity.createTenant(testTenantName);
        var user = tenant.createUser(testUserName);
        
        //testing with Servoy user already logged in
        var result = scopes.svySecurity.login(user);
        jsunit.assertFalse('svySecurity.login should return false if a user is already logged in', result);
        jsunit.assertFalse('Servoy security.login should not be called', servoySecurityLoginCalled);
        
        //mockup case where a servoy user is not logged in 
        mockupSecurity.getUserUID = function() {return null};

        //testing with locked user
        user.lock();
        result = scopes.svySecurity.login(user);
        jsunit.assertFalse('svySecurity.login should return false if a user is locked', result);
        jsunit.assertFalse('Servoy security.login should not be called', servoySecurityLoginCalled);
        
        //testing with locked tenant
        user.unlock();
        tenant.lock();
        result = scopes.svySecurity.login(user);
        jsunit.assertFalse('svySecurity.login should return false if the parent tenant is locked', result);
        jsunit.assertFalse('Servoy security.login should not be called', servoySecurityLoginCalled);
        
        //testing with no user permissions
        tenant.unlock();
        result = scopes.svySecurity.login(user);
        jsunit.assertFalse('svySecurity.login should return false if the user has no permissions granted', result);
        jsunit.assertFalse('Servoy security.login should not be called', servoySecurityLoginCalled);
        
        var role = tenant.createRole(testRoleName);
        role.addPermission(testPermissionName);
        role.addUser(user);

        //testing with Servoy security.login returning false
        result = scopes.svySecurity.login(user);
        jsunit.assertFalse('svySecurity.login should return false if Servoy security.login returns false', result);
        jsunit.assertTrue('Servoy security.login should be called', servoySecurityLoginCalled);
        
        var currentSession = scopes.svySecurity.getSession();
        jsunit.assertNull('There should not be current session', currentSession);
        
        //test successful login
        servoySecurityLoginCalled = false;
        mockupSecurity.login = function() {
            servoySecurityLoginCalled = true;
            //simulating success of security.login
            return true;
        };
        result = scopes.svySecurity.login(user);
        jsunit.assertTrue('svySecurity.login should be successful', result);
        jsunit.assertTrue('Servoy security.login should be called', servoySecurityLoginCalled);
        
        //test the session initialization
        var activeSessions = scopes.svySecurity.getActiveSessions();
        jsunit.assertNotNull('There should be active sessions', activeSessions);
        jsunit.assertEquals('There should be 1 active session', 1, activeSessions.length);
        jsunit.assertEquals('The active session should be for the correct user', testUserName, activeSessions[0].getUserName());
        jsunit.assertEquals('The active session should be for the correct tenant', testTenantName, activeSessions[0].getTenantName());
        jsunit.assertNotNull('The active session should have a start datetime', activeSessions[0].getStart());
        jsunit.assertNull('The active session should not have an end datetime', activeSessions[0].getEnd());
        var activeSessionID = activeSessions[0].getID();
        
        //check the session
        currentSession = scopes.svySecurity.getSession();
        jsunit.assertNotNull('There should be current session after successful login',currentSession);
        jsunit.assertEquals('The current session should be for the test user (same as user\'s active session)', activeSessionID, currentSession.getID());
        
        //test logout
        var servoySecurityLogoutCalled = false;
        mockupSecurity.logout = function() {
            servoySecurityLogoutCalled = true;            
        };        
        scopes.svySecurity.logout();
        jsunit.assertTrue('Servoy security.login should be called', servoySecurityLogoutCalled);
        
        currentSession = scopes.svySecurity.getSession();
        jsunit.assertNull('There should not be current session after user logout', currentSession);
        
        var qry = datasources.db.svy_security.sessions.createSelect();
        qry.where.add(qry.columns.id.eq(activeSessionID));
        var fs = datasources.db.svy_security.sessions.getFoundSet();
        fs.loadRecords(qry);
        jsunit.assertTrue('The session record should be available', fs.getSize() == 1);
        jsunit.assertNotNull('The session end datetime should be set after logout', fs.session_end);

        //test calling svySecurity.login with no argument
        scopes.sharedTestUtils.assertThrows(scopes.svySecurity.login, null, null, 'svySecurity.login should throw error if required user parameter is not specified');
    }
    finally {
        scopes.sharedTestUtils.restoreServoySecurity();
    }
}
