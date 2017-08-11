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
function testCreateTenant(){
    scopes.sharedTestUtils.assertThrows(function() {
        scopes.svySecurity.createTenant();
    }, null, null, 'Should fail if required param not provided to createTenant');
    
    var tenantName = application.getUUID().toString();
    var tenant = scopes.svySecurity.createTenant(tenantName);
    jsunit.assertNotNull('Tenant should be created',tenant);
    jsunit.assertEquals('Tenant name should be set', tenantName,tenant.getName());
    jsunit.assertEquals('Tenant display name should be same as name initially', tenantName,tenant.getDisplayName());
    
    scopes.sharedTestUtils.assertThrows(function() {
        scopes.svySecurity.createTenant(tenantName);
    }, null, null, 'Should fail when trying to create tenant with duplicate name');
    
    var tenant2 = scopes.svySecurity.createTenant(tenantName + '-2');
    jsunit.assertNotNull('Should be able to create multiple tenants', tenant2);
    
}