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
function testCreateGetTenant() {
    var tenants = scopes.svySecurity.getTenants();
    //NOTE: there may already be tenants in the database so we cannot test for the number of tenants
    jsunit.assertNotNull('getTenants should return an empty array if no tenants are created', tenants);

    scopes.sharedTestUtils.assertThrows(scopes.svySecurity.createTenant, null, null, 'Should fail if required param not provided to createTenant');
    
    //test with name longer than 50
    var longName = application.getUUID().toString()+application.getUUID().toString();
    scopes.sharedTestUtils.assertThrows(scopes.svySecurity.createTenant, [longName], null, 'Should fail if tenant name is longer than 50 characters');

    var tenantName = application.getUUID().toString();
    var tenant = scopes.svySecurity.createTenant(tenantName);
    jsunit.assertNotNull('Tenant should be created', tenant);
    jsunit.assertEquals('Tenant name should be set', tenantName, tenant.getName());
    jsunit.assertEquals('Tenant display name should be same as name initially', tenantName, tenant.getDisplayName());

    scopes.sharedTestUtils.assertThrows(function() {
            scopes.svySecurity.createTenant(tenantName);
        }, null, null, 'Should fail when trying to create tenant with duplicate name');

    var maxLengthName = (tenantName + application.getUUID().toString()).substr(1,50);
    var tenant2 = scopes.svySecurity.createTenant(maxLengthName);
    jsunit.assertNotNull('Should be able to create multiple tenants', tenant2);

    var t = scopes.svySecurity.getTenant(tenantName);
    jsunit.assertNotNull('Tenant should be returned', t);
    jsunit.assertEquals('The correct tenant should be returned', tenant.getName(), t.getName());
    
    t = scopes.svySecurity.getTenant(maxLengthName);
    jsunit.assertNotNull('Tenant should be returned', t);
    jsunit.assertEquals('The correct tenant should be returned', tenant2.getName(), t.getName());
    
    //test with a search value exceeding the max length of the storage column
    var searchName = maxLengthName + 'AAA';
    jsunit.assertTrue(searchName != tenant2.getName());
    t = scopes.svySecurity.getTenant(searchName);
    //TODO: this is a Servoy bug - see https://support.servoy.com/browse/SVY-11470!!!
    jsunit.assertNull('Tenant should not be returned - this is a Servoy bug "SVY-11470"', t);    
}

/**
 * @properties={typeid:24,uuid:"DF155E22-DB23-4A42-89B9-482DCA1792B6"}
 */
function testDeleteTenant() {
    var testTenantName1 = application.getUUID().toString();
    var testTenantName2 = application.getUUID().toString();
    var testRoleName1 = application.getUUID().toString();
    var testRoleName2 = application.getUUID().toString();
    var testUserName1 = application.getUUID().toString();
    var testUserName2 = application.getUUID().toString();
    var testPermissionName1 = application.getUUID().toString();
    var testPermissionName2 = application.getUUID().toString();
        
    var mockupSecurity = scopes.sharedTestUtils.getMockupSecurity([testPermissionName1, testPermissionName2], null, true);

    try {
        scopes.sharedTestUtils.setMockupSecurity(mockupSecurity);
        scopes.svySecurity.syncPermissions(); //this needs to be done before granting permissions to roles
        
        //create test tenants/roles/users
        var tenant1 = scopes.svySecurity.createTenant(testTenantName1);
        var role1 = tenant1.createRole(testRoleName1);
        role1.addPermission(testPermissionName1);
        var user1 = tenant1.createUser(testUserName1);
        user1.addRole(role1);

        var tenant2 = scopes.svySecurity.createTenant(testTenantName2);       
        var role2 = tenant2.createRole(testRoleName2);
        role2.addPermission(testPermissionName2);        
        var user2 = tenant2.createUser(testUserName2);
        user2.addRole(role2);
        
        var u = scopes.svySecurity.getUser(testUserName1);
        jsunit.assertNotNull('When users are unique in the system we should be able to get user by only username even without a current logged in tenant/user', u);
        
        //add a duplicate username but for the second tenant
        var user3 = tenant2.createUser(testUserName1);
        scopes.sharedTestUtils.assertThrows(scopes.svySecurity.getUser,[testUserName1],null,'Attempting to get user by username only when duplicates exist and no tenant/user is logged in should result in error');
        
        //delete tenant
        var result = scopes.svySecurity.deleteTenant(tenant2);
        jsunit.assertTrue('Tenant should be deleted', result);
        
        u = scopes.svySecurity.getUser(testUserName2, testTenantName2);
        jsunit.assertNull('User should be deleted', u);
        
        u = scopes.svySecurity.getTenant(testTenantName2);
        jsunit.assertNull('Tenant should be deleted', u);
        
        var qry = datasources.db.svy_security.roles.createSelect();
        qry.where.add(qry.columns.tenant_name.eq(testTenantName2));
        qry.where.add(qry.columns.role_name.eq(testRoleName2));
        var fs = datasources.db.svy_security.roles.getFoundSet();
        fs.loadRecords(qry);
        jsunit.assertEquals('Roles of deleted tenant should be deleted',0,fs.getSize());
        
        //recreate the deleted tenant
        tenant2 = scopes.svySecurity.createTenant(testTenantName2);       
        role2 = tenant2.createRole(testRoleName2);
        role2.addPermission(testPermissionName2);        
        user2 = tenant2.createUser(testUserName2);
        user2.addRole(role2);
        user3 = tenant2.createUser(testUserName1);
                
        //login for tenant/user1
        var loggedIn = scopes.svySecurity.login(user1);
        jsunit.assertTrue('Login should be successful', loggedIn);
        
        u = scopes.svySecurity.getUser(testUserName1);
        jsunit.assertNotNull('When users are NOT unique in the system we should be able to get user by only username ONLY if there is a current logged in tenant/user to filter the data', u);
        jsunit.assertEquals('The user should be for the current tenant',testTenantName1,u.getTenant().getName());
        
        //test trying to delete currently logged in user
        result = tenant1.deleteUser(user1);
        jsunit.assertFalse('Should not be able to delete currently logged in user', result);
        
        //test trying to delete currently logged in tenant
        result = scopes.svySecurity.deleteTenant(tenant1);
        jsunit.assertFalse('Should not be able to delete tenant of currently logged in user', result);
        
        //delete another tenant - this currently fails due to security data filtering after login
        result = scopes.svySecurity.deleteTenant(tenant2);
        jsunit.assertFalse('Should not be able to delete a tenant while another tenant is logged in', result);
        
        scopes.svySecurity.logout();
        
        //after logout should be able to delete user and tenant
        result = tenant1.deleteUser(user1);
        jsunit.assertTrue('Should be able to delete user after logout', result);
                
        result = scopes.svySecurity.deleteTenant(tenant1);
        jsunit.assertTrue('Should be able to delete tenant after logout', result);
        
        result = scopes.svySecurity.deleteTenant(tenant2);
        jsunit.assertTrue('Should be able to delete another tenant after logout', result); 

    } finally {
        scopes.sharedTestUtils.restoreServoySecurity();
    }
}

/**
 * @properties={typeid:24,uuid:"20843304-3C84-489C-B624-ED9C3FDEE80A"}
 */
function testSyncPermissions() {
    var grpName1 = application.getUUID().toString();
    var grpName2 = application.getUUID().toString();
    var perm = scopes.svySecurity.getPermission(grpName1);
    jsunit.assertNull('Permission should not exist', perm);

    try {

        var mockupSecurity = scopes.sharedTestUtils.getMockupSecurity([grpName1, grpName2], null, true);

        //faking here the built-in Servoy security
        //need to use this approach because Servoy unit tests do not support login/authentication with test security settings
        scopes.sharedTestUtils.setMockupSecurity(mockupSecurity);

        scopes.svySecurity.syncPermissions();
        perm = scopes.svySecurity.getPermission(grpName1);
        jsunit.assertNotNull('syncPermissions should have added the new security group as permission', perm);

        //this will simulate "deleting" of a security group as getGroups will return the original dataset
        mockupSecurity = scopes.sharedTestUtils.getMockupSecurity(null, null, true);
        scopes.sharedTestUtils.setMockupSecurity(mockupSecurity);

        var tenant = scopes.svySecurity.createTenant(application.getUUID().toString());
        var role = tenant.createRole(application.getUUID().toString());
        role.addPermission(grpName2);
        
        //test default non-destructive sync
        scopes.svySecurity.syncPermissions();
        perm = scopes.svySecurity.getPermission(grpName1);
        jsunit.assertNull('syncPermissions should delete existing permission records if they are not referenced by a role', perm);
        perm = scopes.svySecurity.getPermission(grpName2);
        jsunit.assertNotNull('syncPermissions should not delete existing permission records if they are referenced by a role', perm);

        //test destructive sync
        scopes.svySecurity.syncPermissions(true);
        perm = scopes.svySecurity.getPermission(grpName2);
        jsunit.assertNull('syncPermissions should delete existing permission records even if they are referenced by a role if forcePermissionRemoval param is true and a matching Servoy security group is not found', perm);
        
    } finally {
        //restore back the original Servoy security
        scopes.sharedTestUtils.restoreServoySecurity();
    }
}

/**
 * Testing login, logout and session initialization and closing
 * @properties={typeid:24,uuid:"5B7F3651-E5CC-49FB-9E56-3CDB64E15AA2"}
 */
function testLoginLogout() {
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

    var initialSessionCount = scopes.svySecurity.getSessionCount();
    jsunit.assertTrue('Session count must be >= 0', initialSessionCount >= 0);

    var tenant = scopes.svySecurity.getTenant();
    jsunit.assertNull('Should return null if no user is logged in', tenant);
    var user = scopes.svySecurity.getUser();
    jsunit.assertNull('Should return null if no user is logged in', user);

    try {
        scopes.sharedTestUtils.setMockupSecurity(mockupSecurity);
        tenant = scopes.svySecurity.createTenant(testTenantName);
        user = tenant.createUser(testUserName);

        //testing with Servoy user already logged in
        var result = scopes.svySecurity.login(user);
        jsunit.assertFalse('svySecurity.login should return false if a user is already logged in', result);
        jsunit.assertFalse('Servoy security.login should not be called', servoySecurityLoginCalled);

        //mockup case where a servoy user is not logged in
        mockupSecurity.getUserUID = function() {
            return null
        };

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
        jsunit.assertEquals('The active session should have 0ms duration', 0, activeSessions[0].getDuration());
        var activeSessionID = activeSessions[0].getID();

        //check the session
        currentSession = scopes.svySecurity.getSession();
        jsunit.assertNotNull('There should be current session after successful login', currentSession);
        jsunit.assertEquals('The current session should be for the test user (same as user\'s active session)', activeSessionID, currentSession.getID());
        jsunit.assertNotNull('The Servoy Client ID should be set',currentSession.getServoyClientID());
        jsunit.assertTrue('The Servoy Client ID should be set',currentSession.getServoyClientID().length > 0);

        var t = scopes.svySecurity.getTenant();
        jsunit.assertNotNull('Should return tenant of current logged in user', t);
        jsunit.assertEquals('Should return tenant of current logged in user', testTenantName, t.getName());
        var u = scopes.svySecurity.getUser();
        jsunit.assertNotNull('Should return current logged in user', u);
        jsunit.assertEquals('Should return current logged in user', testUserName, u.getUserName());

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
        jsunit.assertTrue('The session duration should be set after logout', fs.session_duration > 0);

        //test calling svySecurity.login with no argument
        scopes.sharedTestUtils.assertThrows(scopes.svySecurity.login, null, null, 'svySecurity.login should throw error if required user parameter is not specified');
    } finally {
        scopes.sharedTestUtils.restoreServoySecurity();
    }
}


/**
 * @properties={typeid:24,uuid:"5A04756F-161B-4CB8-BA91-42ECE07C8ACD"}
 */
function testConsumeAccessToken() {
    var testTenantName1 = application.getUUID().toString();
    var testTenantName2 = application.getUUID().toString();
    var testRoleName1 = application.getUUID().toString();
    var testRoleName2 = application.getUUID().toString();
    var testUserName1 = application.getUUID().toString();
    var testUserName2 = application.getUUID().toString();
    var testPermissionName1 = application.getUUID().toString();
    var testPermissionName2 = application.getUUID().toString();
        
    var mockupSecurity = scopes.sharedTestUtils.getMockupSecurity([testPermissionName1, testPermissionName2], null, true);

    try {
        scopes.sharedTestUtils.setMockupSecurity(mockupSecurity);
        scopes.svySecurity.syncPermissions(); //this needs to be done before granting permissions to roles
        
        //create test tenants/roles/users
        var tenant1 = scopes.svySecurity.createTenant(testTenantName1);
        var role1 = tenant1.createRole(testRoleName1);
        role1.addPermission(testPermissionName1);
        var user1 = tenant1.createUser(testUserName1);
        user1.addRole(role1);

        var tenant2 = scopes.svySecurity.createTenant(testTenantName2);       
        var role2 = tenant2.createRole(testRoleName2);
        role2.addPermission(testPermissionName2);        
        var user2 = tenant2.createUser(testUserName2);
        user2.addRole(role2);
        
        //create a token which expires immediately
        var token = user1.generateAccessToken(1);
        jsunit.assertNotNull('Token should be created',token);
        
        application.sleep(2);
        var u = scopes.svySecurity.consumeAccessToken(token);
        jsunit.assertNull('Should not be able to consume an expired token', u);
        
        //create a good token
        token = user1.generateAccessToken(1000000);
        
        //test consuming token with locked user and tenant
        tenant1.lock();
        u = scopes.svySecurity.consumeAccessToken(token);
        jsunit.assertNull('Should not be able to consume token while tenant is locked', u);
        
        tenant1.unlock();
        user1.lock();
        u = scopes.svySecurity.consumeAccessToken(token);
        jsunit.assertNull('Should not be able to consume token while user is locked', u);
        
        //should be able to consume the good token with unlocked tenant & user
        user1.unlock();
        u = scopes.svySecurity.consumeAccessToken(token);
        jsunit.assertNotNull('Should be able to consume the token', u);
        jsunit.assertEquals('The correct user should be returned when consuming the token',user1.getUserName(),u.getUserName());
        jsunit.assertEquals('The correct user should be returned when consuming the token',user1.getTenant().getName(),u.getTenant().getName());
                
        u = scopes.svySecurity.consumeAccessToken(token);
        jsunit.assertNull('Should not be able to consume the same token more than once', u);        
        
    }
    finally {
        scopes.sharedTestUtils.restoreServoySecurity();
    }
}