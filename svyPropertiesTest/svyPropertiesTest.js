/**
 * @properties={typeid:24,uuid:"3A88591C-2960-4820-9B70-3ADF9EBA3D9A"}
 */
function setUp() {
	scopes.svyProperties.changeExternalDBTransactionSupportFlag(true);
	databaseManager.startTransaction();
}

/**
 * @properties={typeid:24,uuid:"22C83990-7338-425D-80E1-2BE96097B156"}
 */
function tearDown() {
	databaseManager.rollbackTransaction();
}

/**
 * @properties={typeid:24,uuid:"869FB669-C5C2-43F0-BB87-06641CB20110"}
 */
function testProperties() {
	var propertyKey = 'svy-properties-test';
	var propertyType = 'test-1';
	var tenantName = 'tenant';
	var userName = 'user1';
	var propValue = 'some value';
	var globalValue = 'some global value';
	var tenantValue = 'some tenant value';

	//initially no properties of that namespace
	var properties = scopes.svyProperties.getProperties(propertyKey);
	jsunit.assertNotNull('properties should be an empty array', properties);
	jsunit.assertEquals('properties should be an empty array', 0, properties.length);

	//convenience methods need to fail when no user is set
	assertThrows(scopes.svyProperties.setUserProperty, [propertyKey, 'a test', propertyType], null, 'setUserProperty should fail if no user is set');
	assertThrows(scopes.svyProperties.setTenantProperty, [propertyKey, 'a test', propertyType], null, 'setTenantProperty should fail if no tenant is set');

	//set user name only
	scopes.svyProperties.setUserName(userName);
	
	//still no tenant
	assertThrows(scopes.svyProperties.setTenantProperty, [propertyKey, 'a test', propertyType], null, 'setTenantProperty should fail if no tenant is set');

	//set tenant name as well
	scopes.svyProperties.setUserName(userName, tenantName);
	
	//we should be able to set a property
	var prop = scopes.svyProperties.setUserProperty(propertyKey, propertyType, propValue);
	jsunit.assertNotNull('property should not be null', prop);
	
	var value = prop.getPropertyValue();
	jsunit.assertEquals('property value should be as set', propValue, value);
	
	//empty required params
	assertThrows(scopes.svyProperties.setUserProperty, [null, propertyType, 'a test'], null, 'setUserProperty should fail if no property key is given');
	assertThrows(scopes.svyProperties.setUserProperty, [propertyKey, null, 'a test'], null, 'setUserProperty should fail if no property type is given');
	
	//there is no global property with that name
	var testProp = scopes.svyProperties.getGlobalProperty(propertyKey, propertyType);
	jsunit.assertNull('property should not be a global property', testProp);

	//there is no tenant property with that name
	testProp = scopes.svyProperties.getTenantProperty(propertyKey, propertyType);
	jsunit.assertNull('property should not be a tenant property', testProp);
	
	//there is a user property
	testProp = scopes.svyProperties.getUserProperty(propertyKey, propertyType);
	jsunit.assertEquals('property should be found', testProp.getPropertyUUID(), prop.getPropertyUUID());
	
	//we should now have one property
	properties = scopes.svyProperties.getProperties(propertyKey);
	jsunit.assertEquals('Property should now exist', 1, properties.length);
	
	//and should be able to set that for a tenant as well
	var tenantProp = scopes.svyProperties.setTenantProperty(propertyKey, propertyType, tenantValue);
	jsunit.assertNotNull('property should not be null', tenantProp);
	
	properties = scopes.svyProperties.getProperties(propertyKey);
	jsunit.assertEquals('Tenant property should now exist', 2, properties.length);
	
	//should add a global property
	prop = scopes.svyProperties.setGlobalProperty(propertyKey, propertyType, globalValue);
	jsunit.assertNotNull('Global property should now exist', prop);
	
	//and now we should have 3
	properties = scopes.svyProperties.getProperties(propertyKey);
	jsunit.assertEquals('There should be 3 properties of that key', 3, properties.length);
	
	prop = scopes.svyProperties.getTenantProperty(propertyKey, propertyType);
	jsunit.assertEquals('Tenant property should be properly returned', tenantProp.getPropertyUUID(), prop.getPropertyUUID());
	
	//add a different property
	var propertyKey2 = 'svy-properties-test-2';
	prop = scopes.svyProperties.setUserProperty(propertyKey2, propertyType, propValue);
	jsunit.assertNotNull('property should not be null', prop);
	
	//we should now have 4 properties
	properties = scopes.svyProperties.getProperties('svy-properties-test%');
	jsunit.assertEquals('Property should now exist', 4, properties.length);
	
	value = scopes.svyProperties.getGlobalPropertyValue(propertyKey, propertyType);
	jsunit.assertEquals('Global value should be ok', globalValue, value);
	value = scopes.svyProperties.getTenantPropertyValue(propertyKey, propertyType);
	jsunit.assertEquals('Tenant value should be ok', tenantValue, value);
	value = scopes.svyProperties.getUserPropertyValue(propertyKey, propertyType);
	jsunit.assertEquals('User value should be ok', propValue, value);
	
	//add another user property (same tenant)
	prop = scopes.svyProperties.setProperty(propertyKey, propertyType, propValue, 'user2', tenantName);
	jsunit.assertEquals('Property should belong to user2', 'user2', prop.getUserName());
	
	//and now we have 5 of that type
	properties = scopes.svyProperties.getPropertiesByType(propertyType);
	jsunit.assertEquals('Property should now exist', 5, properties.length);
	
	//and 1 global of that type
	properties = scopes.svyProperties.getPropertiesByType(propertyType, null);
	jsunit.assertEquals('There should be 1 global property of that type', 1, properties.length);
	
	//and 5 of that type (one global, 1 tenant wide, 2 for user1, 1 for user2)
	properties = scopes.svyProperties.getPropertiesByType(propertyType);
	jsunit.assertEquals('There should be 5 properties of that type', 5, properties.length);	
	
	//and 4 of that tenant (one for each user, one tenant wide, one with different key)
	properties = scopes.svyProperties.getPropertiesByType(propertyType, tenantName);
	jsunit.assertEquals('There should be 4 properties of that type for the tenant', 4, properties.length);
	
	//and 1 tenant wide
	properties = scopes.svyProperties.getPropertiesByType(propertyType, tenantName, null);
	jsunit.assertEquals('There should be 1 tenant wide property', 1, properties.length);
	
	//and now for a different tenant
	prop = scopes.svyProperties.setProperty(propertyKey, propertyType, propValue, 'user3', 'tenant2');
	jsunit.assertEquals('Property should belong to user3', 'user3', prop.getUserName());
	jsunit.assertEquals('Property should belong to tenant2', 'tenant2', prop.getTenantName());
	
	//now we have 6 of that type (one global, 1 tenant wide, 2 for user1, 1 for user2, 1 for user3/tenant2)
	properties = scopes.svyProperties.getPropertiesByType(propertyType);
	jsunit.assertEquals('There should be 6 properties of that type', 6, properties.length);
	
	//get all the properties for tenant
	properties = scopes.svyProperties.getProperties(propertyKey, propertyType, tenantName);
	jsunit.assertEquals('There should be 3 properties of that type for that tenant', 3, properties.length);
	//get all the properties for the user
	properties = scopes.svyProperties.getProperties(propertyKey, propertyType, tenantName, userName);
	jsunit.assertEquals('There should be 1 property of that type for that user', 1, properties.length);
	
	
	//getting properties without type or key should not be allowed
	assertThrows(scopes.svyProperties.getProperties, [null], 'propertyKey required', 'getProperties should throw "propertyKey required"')
	assertThrows(scopes.svyProperties.getPropertiesByType, [null], 'propertyType required', 'getPropertiesByType should throw "propertyType required"')
	assertThrows(scopes.svyProperties.getUserProperty, null, 'No propertyKey provided', 'getUserProperty should throw "No propertyKey provided"')	
	assertThrows(scopes.svyProperties.getUserProperty, [propertyKey], 'No propertyType provided', 'getUserProperty should throw "No propertyType provided"')
	assertThrows(scopes.svyProperties.getGlobalProperty, [propertyKey], 'No propertyType provided', 'getGlobalProperty should throw "No propertyType provided"')
	
	//length should be properly checked for
	var propKeyLong = [];
	for (var i = 1; i <= scopes.svyProperties.MAX_NAMESPACE_LENGTH + 1; i++) {
		propKeyLong.push('x');
	}
	assertThrows(scopes.svyProperties.setUserProperty, [propKeyLong.join(''), propertyType]);
	
	propKeyLong = [];
	for (i = 1; i <= scopes.svyProperties.MAX_TEXT_LENGTH + 1; i++) {
		propKeyLong.push('x');
	}
	assertThrows(scopes.svyProperties.setUserProperty, [propertyKey, propKeyLong.join('')]);
}

/**
 * Expects <b>block</b> to throw an <b>error</b>
 * @public
 * @param {Function} block is usually a function expression that wraps a code to be tested
 * @param {Array<*>} [argsArr]
 * @param {String} [expectedErrMsg]
 * @param {String} [message] the message to use if the assertion fails
 *
 * @properties={typeid:24,uuid:"5685F610-241E-48F5-ABE4-E3820AA3DD97"}
 */
function assertThrows(block, argsArr, expectedErrMsg, message) {
	try {
		if (argsArr) {
			block.apply(this, argsArr);
		} else {
			block(); // executes block
		}
	} catch (e) {
		if (expectedErrMsg) {
			if (expectedErrMsg == e.message) {
				// Means that the expected and the thrown error messages are the same
				return;
			}
			jsunit.fail(utils.stringFormat('%1$s - Expected error [%2$s]. Actual error [%3$s].', [message, expectedErrMsg, e.message]));
		}

		//means an error is thrown as expected
		return;
	}

	jsunit.fail(utils.stringFormat('%1$s - Error is not thrown.', [message]));
}

