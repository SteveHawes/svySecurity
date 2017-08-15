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
function testCreateGetDeleteUser() {

    var testTenantName = application.getUUID().toString();
    var tenant = scopes.svySecurity.createTenant(testTenantName);
    var testUserName = application.getUUID().toString();
    var testPwd = 'BBBBB';
    
    var users = tenant.getUsers();
    jsunit.assertNotNull('Users should be an empty array', users);
    jsunit.assertEquals('Users should be an empty array', 0, users.length);
    
    scopes.sharedTestUtils.assertThrows(tenant.getUser, null, null, 'Should fail if required param not provided to tenant.getUser');
    
    var u = tenant.getUser(testUserName);
    jsunit.assertNull('User should not be returned', u);
       
    var user = tenant.createUser(testUserName, testPwd);
    jsunit.assertNotNull('User object instance should be created', user);
    jsunit.assertEquals('Username must be set', testUserName, user.getUserName());    
    jsunit.assertEquals('User display name should match username initially', testUserName, user.getDisplayName());
    jsunit.assertTrue('User password must be set', user.checkPassword(testPwd));

    users = tenant.getUsers();    
    jsunit.assertEquals('Users should contain 1 element', 1, users.length);
    jsunit.assertEquals('The correct user should be included',testUserName, users[0].getUserName());
    
    u = tenant.getUser(testUserName);
    jsunit.assertNotNull('User should be returned', u);
    jsunit.assertEquals('The correct user should be included',testUserName, u.getUserName());
    
    
    scopes.sharedTestUtils.assertThrows(tenant.createUser, null, null, 'Should fail if required param not provided to tenant.createUser');
    
    scopes.sharedTestUtils.assertThrows(tenant.createUser, [testUserName], null, 'Should fail if attempting to create users with duplicate username for the same tenant');
    
    var tenant2 = scopes.svySecurity.createTenant(testTenantName + '-2');
    var user2 = tenant2.createUser(testUserName, testPwd);
    jsunit.assertEquals('Should be able to create 2 users with the same username for different tenants',testUserName, user2.getUserName());
    
    scopes.sharedTestUtils.assertThrows(tenant.deleteUser, null, null, 'Should fail if required param not provided to tenant.deleteUser');
    
    //try deleting user from a different tenant
    var deleted = tenant2.deleteUser(user);
    jsunit.assertFalse('Attempting to delete a user from different tenant should not be successful', deleted);
    jsunit.assertNotNull('The user should not be deleted',tenant.getUser(user.getUserName()));
    
    //try deleting using user object
    deleted = tenant2.deleteUser(user2);
    jsunit.assertTrue('Delete by user obj should be successful', deleted);
    jsunit.assertNull('The user should be deleted', tenant2.getUser(user2.getUserName()));
    
    //try deleting user by username
    deleted = tenant.deleteUser(user.getUserName());
    jsunit.assertTrue('Delete by username should be successful', deleted);
    jsunit.assertNull('The user should be deleted', tenant.getUser(user.getUserName()));
    
}

/**
 * @properties={typeid:24,uuid:"0B852E65-7322-409D-8272-58C50BAF4AB1"}
 */
function testTenantRoles() {
    var testTenantName1 = application.getUUID().toString();
    var testTenantName2 = application.getUUID().toString();
    var testRoleName1 = application.getUUID().toString();
    var testRoleName2 = application.getUUID().toString();
    var testRoleName3 = application.getUUID().toString();
    var testUserName = application.getUUID().toString();
    
    var tenant1 = scopes.svySecurity.createTenant(testTenantName1);
    var tenant2 = scopes.svySecurity.createTenant(testTenantName2);
    
    var roles = tenant1.getRoles();
    jsunit.assertNotNull('Roles should be empty array', roles);
    jsunit.assertEquals('Roles should be empty array', 0, roles.length);
    
    
    var roleT1R1 = tenant1.createRole(testRoleName1);
    jsunit.assertNotNull('Role should be created', roleT1R1);
    jsunit.assertEquals('Role should be created with correct name', testRoleName1, roleT1R1.getName());
    jsunit.assertEquals('Role should be created with correct display name', testRoleName1, roleT1R1.getDisplayName());

    var roleT1R2 = tenant1.createRole(testRoleName2);
    jsunit.assertNotNull('Role should be created', roleT1R2);
    
    scopes.sharedTestUtils.assertThrows(tenant1.createRole,[testRoleName1],null,'Should not be able to create duplicate roles for the same tenant');
    scopes.sharedTestUtils.assertThrows(tenant1.createRole,null,null,'Should not be able to create role without specifying a name');
    
    var roleT2R1 = tenant2.createRole(testRoleName1);
    jsunit.assertNotNull('Role with same name should be created but for different vendor', roleT2R1);
    var roleT2R3 = tenant2.createRole(testRoleName3); //this role is only for tenant2
    
    roles = tenant1.getRoles();
    jsunit.assertEquals('Roles should contain 2 elements', 2, roles.length);
    
    scopes.sharedTestUtils.assertThrows(tenant1.getRole,null,null,'Tenant.getRole should fail if required parameter is not provided');
    
    var role = tenant1.getRole(testRoleName1);
    jsunit.assertNotNull('Role should be found', role);
    
    role = tenant1.getRole(testRoleName3); //this role is only for tenant2
    jsunit.assertNull('Role should not be found', role);
    
    scopes.sharedTestUtils.assertThrows(tenant2.deleteRole,null,null,'Tenant.deleteRole should fail if required parameter is not provided');
    
    //test deleting role using role obj
    tenant2.deleteRole(roleT2R3);
    jsunit.assertNull('Role should be deleted', tenant2.getRole(testRoleName3));
    
    //test deleting role from another tenant using role obj
    scopes.sharedTestUtils.assertThrows(tenant2.deleteRole, [roleT1R1], null, 'Should not be able to delete a role associated with a differnt tenant');
    
    //test deleting role from another tenant using role name
    scopes.sharedTestUtils.assertThrows(tenant2.deleteRole, [testRoleName2], null, 'Should not be able to delete a role associated with a differnt tenant');
    
    //test deleting role using role name
    tenant2.deleteRole(testRoleName1);
    jsunit.assertNull('Role should be deleted', tenant2.getRole(testRoleName1));
    jsunit.assertNotNull('Role with same name in another tenant should remain',tenant1.getRole(testRoleName1));
}

