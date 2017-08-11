/**
 * @properties={typeid:24,uuid:"4BD70156-DC69-4F21-AD6C-B3B2CDC5B75C"}
 */
function setUp() {
    scopes.sharedTestUtils.setUp();
}

/**
 * @properties={typeid:24,uuid:"7B9B2A5E-4F0A-4AC6-B511-60404870415D"}
 */
function tearDown() {
    scopes.sharedTestUtils.tearDown();
}

/**
 * @properties={typeid:24,uuid:"1D6EEABD-34DD-4857-B968-81E16370CB13"}
 */
function testTenantConstructor() {

    scopes.sharedTestUtils.assertThrows(function() {
            var t = new scopes.svySecurity.Tenant()
        }, null, null, 'Should fail if required param not provided to Tenant constructor');

    /** @type {JSRecord<db:/svy_security/tenants>} */
    var fakeRec = { };

    var tenant = new scopes.svySecurity.Tenant(fakeRec);
    jsunit.assertNotNull('should have created an instance of tenant', tenant);
}

/**
 * @properties={typeid:24,uuid:"0224F0DA-EB12-4B63-AB1A-89AB1200F4AD"}
 */
function testCreateUser() {

    var testTenantName = application.getUUID().toString();
    var tenant = scopes.svySecurity.createTenant(testTenantName);
    var testUserName = 'AAAAA';
    var testPwd = 'BBBBB';
    var user = tenant.createUser(testUserName, testPwd);

    jsunit.assertNotNull('User object instance should be created', user);
    jsunit.assertEquals('Username must be set', testUserName, user.getUserName());    
    jsunit.assertEquals('User display name should match username initially', testUserName, user.getDisplayName());
    jsunit.assertTrue('User password must be set', user.checkPassword(testPwd));

    scopes.sharedTestUtils.assertThrows(function() {
        tenant.createUser();
    }, null, null, 'Should fail if required param not provided to tenant.createUser');
    
    scopes.sharedTestUtils.assertThrows(function() {
        tenant.createUser(testUserName);
    }, null, null, 'Should fail if attempting to create users with duplicate username for the same tenant');
    
    var tenant2 = scopes.svySecurity.createTenant(testTenantName + '-2');
    var user2 = tenant2.createUser(testUserName, testPwd);
    jsunit.assertEquals('Should be able to create 2 users with the same username for different tenants',testUserName,user2.getUserName());
    
    
}

