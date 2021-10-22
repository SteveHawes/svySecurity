/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"F6E34104-CA03-4A9D-8ECB-2CCAB3E747CD",variableType:8}
 */
var MAX_TENANTNAME_LENGTH = 50;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"BB9ABC90-B18B-49F5-AF5B-9792EBCAFE73",variableType:4}
 */
var MAX_SOLUTION_NAME_LENGTH = 50;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"F45AB1DC-D4F8-4304-AFE5-0F6206F04BC4",variableType:8}
 */
var MAX_USERNAME_LENGTH = 254;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"08287BA8-C3FE-46A0-A801-382F605A33FE",variableType:8}
 */
var MAX_NAMESPACE_LENGTH = 500;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"3825EDC1-EC8B-4E78-BCC5-D9AEDEFB6BAF",variableType:8}
 */
var MAX_TYPE_LENGTH = 50;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"91FC2B4E-B761-4A8A-A3E2-E59F5886D498",variableType:8}
 */
var MAX_VALUE_LENGTH = 50000000;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"C6CE548F-4176-410E-8E91-1C0DABD22178",variableType:8}
 */
var MAX_DISPLAYNAME_LENGTH = 500;

/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"B9F3592D-ECF0-49C2-9795-CC5678B5ED59"}
 */
var IGNORE_PARAMETER = 'ignore-query-parameter';

/**
 * @private
 * @properties={typeid:35,uuid:"49CEE483-8E4C-4EA3-B0B6-43276C956D47",variableType:-4}
 */
var log = scopes.svyLogManager.getLogger("com.servoy.svyproperties");

/**
 * @type {String}
 * @private 
 *
 * @properties={typeid:35,uuid:"C3DD2F6E-F232-4070-8CF3-9C02BBB7CF67"}
 */
var activeUserName;

/**
 * @type {String}
 * @private 
 *
 * @properties={typeid:35,uuid:"30EF256B-D6ED-4975-8BBF-7F02F3BE46EF"}
 */
var activeTenantName;

/**
 * @type {String}
 * @private 
 *
 * @properties={typeid:35,uuid:"920780CB-8C20-4263-B682-E2BF198DBC40"}
 */
var activeSolutionName = application.getSolutionName();

/**
 * If false then when saving or deleting security-related records
 * if an external DB transaction is detected the operation will fail.
 * If true then when saving or deleting security-related records the
 * module will start/commit a DB transaction only if an external DB transaction
 * is not detected. On exceptions any DB transaction will be rolled back
 * regardless if it is started internally or externally (exceptions will be propagated
 * to the external transaction so callers will be able to react on them accordingly)
 *
 * @private
 *
 * @properties={typeid:35,uuid:"84761869-24A7-4222-8A45-E47DB3D1993F",variableType:-4}
 */
var supportExternalDBTransaction = false;

/**
 * Use this method to change the behavior of the svyProperties module with respect
 * to DB transactions.
 *
 * If the flag is set to false (default) then when saving or deleting security-related records
 * if an external DB transaction is detected the operation will fail.
 * If the flag is set to true then when saving or deleting security-related records the
 * module will start/commit a DB transaction only if an external DB transaction
 * is not detected. On exceptions any DB transaction will be rolled back
 * regardless if it is started internally or externally (exceptions will be propagated
 * to the external transaction so callers will be able to react on them accordingly)
 *
 * @note If using external DB transactions then callers are responsible for refreshing
 * the state of security-related objects upon transaction rollbacks which occur after
 * successful calls to the svyProperties API.
 *
 * @public 
 * @param {Boolean} mustSupportExternalTransactions The value for the supportExternalDBTransaction flag to set.
 *
 *
 * @properties={typeid:24,uuid:"E96349F8-049D-412F-B4E6-B8B8C7BAB3C6"}
 */
function changeExternalDBTransactionSupportFlag(mustSupportExternalTransactions) {
	supportExternalDBTransaction = mustSupportExternalTransactions;
}

/**
 * @protected
 * @param {JSRecord<db:/svy_security/svy_properties>} record
 * @constructor
 * @properties={typeid:24,uuid:"3C23975A-4BB1-4FB6-8D39-07B99D632C4C"}
 * @AllowToRunInFind
 */
function Property(record) {
	if (!record) {
		throw new Error('Property record is not specified');
	}
	
	/** 
	 * @protected 
	 * @type {JSRecord<db:/svy_security/svy_properties>} 
	 * */
	this.record = record;

}

/**
 * @constructor 
 * @private 
 * @properties={typeid:24,uuid:"562A35E1-6C6C-4D39-8487-F95725F0E8F2"}
 */
function initProperty() {
	Property.prototype = Object.create(Property.prototype);
	Property.prototype.constructor = Property;
	
    /**
     * Gets the property uuid for this property.
     *
     * @public
     * @return {UUID} The property uuid of this property.
     * @this {Property}
     */
	Property.prototype.getPropertyUUID = function() {
        return this.record.property_uuid;
    }
	
    /**
     * Gets the display name for this property.
     *
     * @public
     * @return {String} The property value of this property. Can be null if a display name is not set.
     * @this {Property}
     */
    Property.prototype.getDisplayName = function() {
        return this.record.display_name;
    }
    
    /**
     * Sets the property display name for this property.
     *
     * @public
     * @return {Property} The property uuid of this property.
     * @this {Property}
     */
    Property.prototype.setDisplayName = function(displayName) {
    	if (!textLengthIsValid(displayName, MAX_DISPLAYNAME_LENGTH)) {
    		throw new Error(utils.stringFormat('DisplayName must be between 1 and %1$s characters long.', [MAX_DISPLAYNAME_LENGTH]));
    	}
    	this.record.display_name = displayName;
        saveRecord(this.record);
        return this;
    }
	
    /**
     * Gets the property value for this property.
     *
     * @public
     * @return {String} The property value of this property. Can be null if a property value is not set.
     * @this {Property}
     */
    Property.prototype.getPropertyValue = function() {
        return this.record.property_value;
    }

    /**
     * Sets the property value for this property.
     * 
     * @public
     * @param {String} propertyValue 
     * @return {Property} This property for call-chaining support.
     * @this {Property}
     */
    Property.prototype.setPropertyValue = function(propertyValue) {
    	if (!textLengthIsValid(propertyValue, MAX_VALUE_LENGTH)) {
    		throw new Error(utils.stringFormat('PropertyValue must be between 0 and %1$s characters long.', [MAX_VALUE_LENGTH]));
    	}
    	
    	this.record.property_value = propertyValue;
        saveRecord(this.record);
        return this;
    }
    
    /**
     * Gets the tenant name for this property.
     *
     * @public
     * @return {String} The tenant name of this property. Can be null if a tenant name is not set.
     * @this {Property}
     */
    Property.prototype.getTenantName = function() {
        return this.record.tenant_name;
    }
    
    /**
     * Gets the user name for this property.
     *
     * @public
     * @return {String} The user name of this property. Can be null if a user name is not set.
     * @this {Property}
     */
    Property.prototype.getUserName = function() {
        return this.record.user_name;
    }    
    
    /**
     * Gets the solution name for this property.
     *
     * @public
     * @return {String} The solution name of this property. Can be null if a solution name is not set.
     * @this {Property}
     */
    Property.prototype.getSolutionName = function() {
        return this.record.solution_name;
    }    
    
    /**
     * Immediately and permanently deletes this property.
     * @note USE WITH CAUTION! There is no undo for this operation.
     * 
     * @public 
     * @return {Boolean} true if property could be deleted
     * @this {Property}
     */
    Property.prototype.deleteProperty = function() {
    	try {
	    	return deleteRecord(this.record);
        } catch (e) {
        	log.error(utils.stringFormat('Could not delete property %1$. Unknown error: %2$. Check log.', [this.getPropertyUUID(), e.message]));
            throw e;
        }
    }
}

/**
 * Sets the user and tenant name for the logged in user<br>
 * Both are used in all convenience methods to get or set properties for the user or the tenant<br>
 * When svySecurity is used, this is called automatically after login
 * 
 * @param {String} userName the name of the active user for which user related properties are stored
 * @param {String} [tenantName] the name of the tenant of the active user
 * 
 * @public 
 * 
 * @example 
 * <pre>
 * function onSolutionOpen(arg, queryParams) {
 *   // don't set the tenant if the solution doesn't support multi-tenancy
 *   // scopes.svyProperties.setUserName(loggedUserName);
 * 
 *   scopes.svyProperties.setUserName(loggedUniqueUserName, loggedUniqueTenantName);
 * }
 * </pre>
 * @properties={typeid:24,uuid:"5034AE07-D459-4B84-A351-9AD78D6986D8"}
 */
function setUserName(userName, tenantName) {
	activeUserName = userName;
	activeTenantName = tenantName;
}

/**
 * Sets the solution name for the logged in user<br>
 * It is used in all convenience methods to get or set properties for the solution<br>
 * 
 * @param {String} solutionName the name of the active solution for which solution related properties are stored
 * 
 * @public 
 * 
 * @example 
 * <pre>
 * function onSolutionOpen(arg, queryParams) {
 *   // don't set the solution name if solution specific properties are not required
 *   // scopes.svyProperties.setSolutionName(solutionName);
 * 
 *   scopes.svyProperties.setUserName(loggedUniqueUserName, loggedUniqueTenantName);
 * }
 * </pre>
 *
 * @properties={typeid:24,uuid:"7FFFDE9B-265B-4149-8738-80DE4082E826"}
 */
function setSolutionName(solutionName) {
	activeSolutionName = solutionName;
}

/**
 * Returns the property with the given key and type for the user set via <code>setUserName()</code>
 * 
 * @param {String} propertyKey the identifier for the property
 * @param {String} propertyType the type of property (typically an enum value)
 * 
 * @return {Property} the property found or null if not found
 * 
 * @public 
 * 
 * @example
 * <pre>
 * function onShow(firstShow, event) {
 * 	var propertyKey = application.getSolutionName() + "-" + controller.getName() + "-" + elements.table.getName();
 *	var columnState = scopes.svyProperties.getUserProperty(propertyKey, 'table-state');
 *	
 *	// restore the ng-grid state 
 *	if (columnState) elements.table.restoreColumnState(columnState.getPropertyValue());
 * }
 * </pre>
 *
 * @properties={typeid:24,uuid:"784F54F9-57F4-4349-8C81-F04F315A7F33"}
 */
function getUserProperty(propertyKey, propertyType) {
	if (!activeUserName) {
		throw new Error('No user name set in svyProperties. Make sure a user name is set by calling setUserName().');
	}
	return getProperty(propertyKey, propertyType, activeTenantName, activeUserName);
}

/**
 * Returns the value of the property with the given key and type for the user set via <code>setUserName()</code>
 * 
 * @param {String} propertyKey the identifier for the property
 * @param {String} propertyType the type of property (typically an enum value)
 * 
 * @return {String} the value of the property found or null if not found
 * 
 * @public 
 * 
 * @example
 * <pre>
 * function onShow(firstShow, event) {
 * 	var propertyKey = application.getSolutionName() + "-" + controller.getName() + "-" + elements.table.getName();
 *	var columnState = scopes.svyProperties.getUserPropertyValue(propertyKey, 'table-state');
 *	
 *	// restore the ng-grid state 
 *	if (columnState) elements.table.restoreColumnState(columnState);
 * }
 * </pre>
 *
 * @properties={typeid:24,uuid:"8EB62BF0-4854-4FAA-B655-D750ACC63AAC"}
 */
function getUserPropertyValue(propertyKey, propertyType) {
	if (!activeUserName) {
		throw new Error('No user name set in svyProperties. Make sure a user name is set by calling setUserName().');
	}
	var property = getProperty(propertyKey, propertyType, activeTenantName, activeUserName);
	if (property) {
		return property.getPropertyValue();
	} else {
		return null;
	}
}

/**
 * Returns the tenant wide property with the given key and type for the tenant set via <code>setUserName()</code><br>
 * Tenant wide properties are properties where the user name is not set
 * 
 * @param {String} propertyKey the identifier for the property
 * @param {String} propertyType the type of property (typically an enum value)
 * 
 * @return {Property} the property found or null if not found
 * 
 * @public 
 *
 * @properties={typeid:24,uuid:"2535BE78-C669-47E6-805C-A794F8750C90"}
 */
function getTenantProperty(propertyKey, propertyType) {
	if (!activeTenantName) {
		throw new Error('No tenant name set in svyProperties. Make sure a tenant name is set by calling setUserName().');
	}
	return getProperty(propertyKey, propertyType, activeTenantName, null);
}

/**
 * Returns the value of the tenant wide property with the given key and type for the tenant set via <code>setUserName()</code><br>
 * Tenant wide properties are properties where the user name is not set
 * 
 * @param {String} propertyKey the identifier for the property
 * @param {String} propertyType the type of property (typically an enum value)
 * 
 * @return {String} the value of the property found or null if not found
 * 
 * @public 
 *
 * @properties={typeid:24,uuid:"DFFAF6A5-16FD-4141-8E02-8271D602986B"}
 */
function getTenantPropertyValue(propertyKey, propertyType) {
	if (!activeTenantName) {
		throw new Error('No tenant name set in svyProperties. Make sure a tenant name is set by calling setUserName().');
	}
	var property = getProperty(propertyKey, propertyType, activeTenantName, null);
	if (property) {
		return property.getPropertyValue();
	} else {
		return null;
	}
}

/**
 * Returns the property with the given key and type for the solution set via <code>setSolutionName()</code>
 * 
 * @param {String} propertyKey the identifier for the property
 * @param {String} propertyType the type of property (typically an enum value)
 * 
 * @return {Property} the property found or null if not found
 * 
 * @public 
 * 
 * @example
 * <pre>
 * function onShow(firstShow, event) {
 * 	var propertyKey = application.getSolutionName() + "-" + controller.getName() + "-" + elements.table.getName();
 *	var columnState = scopes.svyProperties.getUserProperty(propertyKey, 'table-state');
 *	
 *	// restore the ng-grid state 
 *	if (columnState) elements.table.restoreColumnState(columnState.getPropertyValue());
 * }
 * </pre>
 *
 * @properties={typeid:24,uuid:"B7AF9215-710E-402A-BEB2-9DE23E7A1441"}
 */
function getSolutionProperty(propertyKey, propertyType) {
	if (!activeSolutionName) {
		throw new Error('No solution name set in svyProperties. Make sure a solution name is set by calling setSolutionName().');
	}
	return getProperty(propertyKey, propertyType, activeTenantName, activeUserName, activeSolutionName);
}

/**
 * Returns the value of the property with the given key and type for the solution set via <code>setSolutionName()</code>
 * 
 * @param {String} propertyKey the identifier for the property
 * @param {String} propertyType the type of property (typically an enum value)
 * 
 * @return {String} the value of the property found or null if not found
 * 
 * @public 
 * 
 * @example
 * <pre>
 * function onShow(firstShow, event) {
 * 	var propertyKey = application.getSolutionName() + "-" + controller.getName() + "-" + elements.table.getName();
 *	var columnState = scopes.svyProperties.getUserPropertyValue(propertyKey, 'table-state');
 *	
 *	// restore the ng-grid state 
 *	if (columnState) elements.table.restoreColumnState(columnState);
 * }
 * </pre>
 *
 * @properties={typeid:24,uuid:"CE5F5200-4B3C-46F8-9479-A06C5F43C9F3"}
 */
function getSolutionPropertyValue(propertyKey, propertyType) {
	if (!activeUserName) {
		throw new Error('No solution name set in svyProperties. Make sure a solution name is set by calling setSolutionName().');
	}
	var property = getProperty(propertyKey, propertyType, activeTenantName, activeUserName, activeSolutionName);
	if (property) {
		return property.getPropertyValue();
	} else {
		return null;
	}
}


/**
 * Returns the global property with the given key and type<br>
 * Global properties are properties where the tenant and user name is not set
 * 
 * @param {String} propertyKey the identifier for the property
 * @param {String} propertyType the type of property (typically an enum value)
 * 
 * @return {Property} the property found or null if not found
 * 
 * @public 
 *
 * @properties={typeid:24,uuid:"86FF4B96-8D1E-4499-B62C-7E3073930E4A"}
 */
function getGlobalProperty(propertyKey, propertyType) {
	return getProperty(propertyKey, propertyType, null, null, null);
}

/**
 * Returns the value of the global property with the given key and type<br>
 * Global properties are properties where the tenant and user name is not set
 * 
 * @param {String} propertyKey the identifier for the property
 * @param {String} propertyType the type of property (typically an enum value)
 * 
 * @return {String} the value of the property found or null if not found
 * 
 * @public 
 *
 * @properties={typeid:24,uuid:"F7E35C5D-B22F-4798-AAE8-F1C498699E30"}
 */
function getGlobalPropertyValue(propertyKey, propertyType) {
	var property = getProperty(propertyKey, propertyType, null, null, null);
	if (property) {
		return property.getPropertyValue();
	} else {
		return null;
	}
}

/**
 * Returns the property with the given key and type or null if not found<br>
 * All parameters given need to match exactly
 * 
 * @param {String} propertyKey the identifier for the property
 * @param {String} propertyType the type of property (typically an enum value)
 * @param {String} [tenantName] the tenant name for which this property is stored
 * @param {String} [userName] the user name for which this property is stored
 * @param {String} [solutionName] the solution name for which this property is stored
 * 
 * @return {Property} the property found or null if not found
 * 
 * @public 
 *
 * @properties={typeid:24,uuid:"623D678C-543A-45DE-99BA-27027352B03C"}
 */
function getProperty(propertyKey, propertyType, tenantName, userName, solutionName) {
	if (!propertyKey || !propertyType) {
		if (!propertyKey) {
			throw new Error('No propertyKey provided');
		}
		if (!propertyType) {
			throw new Error('No propertyType provided');
		}
	}
	var query = datasources.db.svy_security.svy_properties.createSelect();
	query.result.addPk();
	query.where.add(query.columns.property_namespace.eq(propertyKey));
	query.where.add(query.columns.property_type.eq(propertyType));
	if (userName) {
		query.where.add(query.columns.user_name.eq(userName));
	} else {
		query.where.add(query.columns.user_name.isNull);		
	}
	if (tenantName) {
		query.where.add(query.columns.tenant_name.eq(tenantName));
	} else {
		query.where.add(query.columns.tenant_name.isNull);		
	}
	if (solutionName) {
		query.where.add(query.columns.solution_name.eq(solutionName));
	} else {
		query.where.add(query.columns.solution_name.isNull);		
	}
	var fs = datasources.db.svy_security.svy_properties.getFoundSet();
	fs.loadRecords(query);
	
	if (utils.hasRecords(fs)) {
		if (fs.getSize() > 1) {
			log.warn('More than one property found for propertyKey "{}", propertyType "{}", tenantName "{}",  userName "{}" and solutionName"{}"', propertyKey, propertyType, tenantName, userName, solutionName);
		}
		return new Property(fs.getRecord(1));
	} else {
		return null;
	}
}

/**
 * Sets the given value to the user property with the given key and type or creates a new property if not found
 * 
 * @param {String} propertyKey the identifier for the property
 * @param {String} propertyType the type of property (typically an enum value)
 * @param {String} value the string value of the property
 * 
 * @return {Property}
 * 
 * @public 
 * 
 * @example
 * <pre>
 * //persist the state of the NG Grid as user property  
 * function onColumnStateChanged(columnState) {
 *	 var propertyNameSpace = application.getSolutionName() + "-" + controller.getName() + "." + elements.table.getName();	
 *	 scopes.svyProperties.setUserProperty(propertyNameSpace, 'table-state', columnState);
 * }
 * </pre>
 *
 * @properties={typeid:24,uuid:"9D0EB628-D482-4953-BC52-1F30601E590C"}
 */
function setUserProperty(propertyKey, propertyType, value) {
	if (!activeUserName) {
		throw new Error('No user name set in svyProperties. Make sure a user name is set by calling setUserName().');
	}
	return setProperty(propertyKey, propertyType, value, activeUserName, activeTenantName);
}

/**
 * Sets the given value to the tenant wide property with the given key and type or creates a new property if not found<br>
 * Tenant wide properties are properties where the user name is not set
 * 
 * @param {String} propertyKey the identifier for the property
 * @param {String} propertyType the type of property (typically an enum value)
 * @param {String} value the string value of the property
 * 
 * @return {Property}
 * 
 * @public 
 *
 * @properties={typeid:24,uuid:"7B71FEFD-50AF-413B-BF62-17D372CE98CE"}
 */
function setTenantProperty(propertyKey, propertyType, value) {
	if (!activeTenantName) {
		throw new Error('No tenant name set in svyProperties. Make sure a tenant name is set by calling setUserName().');
	}
	return setProperty(propertyKey, propertyType, value, null, activeTenantName);
}

/**
 * Sets the given value to the solution wide property with the given key and type or creates a new property if not found<br>
 * Solution wide properties can be further refined by specifying a tenant and/or username
 * 
 * @param {String} propertyKey the identifier for the property
 * @param {String} propertyType the type of property (typically an enum value)
 * @param {String} value the string value of the property
 * 
 * @return {Property}
 * 
 * @public 
 *
 * @properties={typeid:24,uuid:"29C09F7D-02D3-40E5-B69D-96BDAC666A2A"}
 */
function setSolutionProperty(propertyKey, propertyType, value) {
	if (!activeSolutionName) {
		throw new Error('No tenant name set in svyProperties. Make sure a tenant name is set by calling setUserName().');
	}
	return setProperty(propertyKey, propertyType, value, activeUserName, activeTenantName, activeSolutionName);
}

/**
 * Sets the given value to the global property with the given key and type or creates a new property if not found<br>
 * Global properties are properties where the tenant and user name is not set
 * 
 * @param {String} propertyKey the identifier for the property
 * @param {String} propertyType the type of property (typically an enum value)
 * @param {String} value the string value of the property
 * 
 * @return {Property}
 * 
 * @public 
 *
 * @properties={typeid:24,uuid:"3E48CC2C-F3B6-4462-9CB2-3D69D5F69B27"}
 */
function setGlobalProperty(propertyKey, propertyType, value) {
	return setProperty(propertyKey, propertyType, value, null, null, null);
}

/**
 * Sets the given value to the property with the given key and type or creates a new property if not found
 * 
 * @param {String} propertyKey the identifier for the property
 * @param {String} propertyType the type of property (typically an enum value)
 * @param {String} value the string value of the property
 * @param {String} userName the user name for which this property is stored
 * @param {String} tenantName the tenant name for which this property is stored
 * @param {String} [solutionName] the solution name for which this property is stored
 * 
 * @return {Property}
 * 
 * @public 
 *
 * @properties={typeid:24,uuid:"C64333B6-744C-4F07-ACBF-31DF4BD627F3"}
 */
function setProperty(propertyKey, propertyType, value, userName, tenantName, solutionName) {
	var property = getOrCreateProperty(propertyKey, propertyType, solutionName, tenantName, userName, value);
	return property.setPropertyValue(value);
}

/**
 * Creates a new property for with the given name space
 * 
 * @param {String} propertyKey
 * @param {String} propertyType
 * @param {String} propertyValue
 * @param {String} [tenantName]
 * @param {String} [userName]
 * @param {String} [solutionName]
 * 
 * @return {Property}
 * @private  
 * 
 * @throws {Error, scopes.svyDataUtils.ValueNotUniqueException}
 *
 * @properties={typeid:24,uuid:"08D8D77A-FC88-453D-A9CA-9B320A9CF2F3"}
 */
function createProperty(propertyKey, propertyType, propertyValue, solutionName, tenantName, userName) {
	if (!propertyKey) {
		throw new Error('propertyKey cannot be null or empty');
	}
	if (!propertyType) {
		throw new Error('propertyType cannot be null or empty');
	}

	if (!textLengthIsValid(propertyKey, MAX_NAMESPACE_LENGTH)) {
		throw new Error(utils.stringFormat('PropertyKey must be between 0 and %1$s characters long.', [MAX_NAMESPACE_LENGTH]));
	}

	if (!textLengthIsValid(propertyValue, MAX_VALUE_LENGTH)) {
		throw new Error(utils.stringFormat('PropertyValue must be between 0 and %1$s characters long.', [MAX_VALUE_LENGTH]));
	}

	if (!textLengthIsValid(propertyType, MAX_TYPE_LENGTH)) {
		throw new Error(utils.stringFormat('PropertyType must be between 1 and %1$s characters long.', [MAX_TYPE_LENGTH]));
	}

	if (!textLengthIsValid(tenantName, MAX_TENANTNAME_LENGTH)) {
		throw new Error(utils.stringFormat('TenantName must be between 1 and %1$s characters long.', [MAX_TENANTNAME_LENGTH]));
	}

	if (!textLengthIsValid(solutionName, MAX_SOLUTION_NAME_LENGTH)) {
		throw new Error(utils.stringFormat('SolutionName must be between 1 and %1$s characters long.', [MAX_SOLUTION_NAME_LENGTH]));
	}

	if (!textLengthIsValid(userName, MAX_USERNAME_LENGTH)) {
		throw new Error(utils.stringFormat('UserName must be between 1 and %1$s characters long.', [MAX_USERNAME_LENGTH]));
	}

	var fs = datasources.db.svy_security.svy_properties.getFoundSet();

	// Check if value is unique values
	var fsExists = scopes.svyDataUtils.getFoundSetWithExactValues(fs.getDataSource(), ["property_namespace", "property_type", "tenant_name", "user_name", "solution_name"], [propertyKey, propertyType, tenantName, userName, solutionName]);
	if (fsExists.getSize()) {
		// return the exception here !?
		throw new scopes.svyDataUtils.ValueNotUniqueException("There is already a property for values", fsExists);
	}

	var rec = fs.getRecord(fs.newRecord(false, false));
	rec.property_namespace = propertyKey;
	rec.property_type = propertyType;
	rec.property_value = propertyValue;
	rec.tenant_name = tenantName;
	rec.user_name = userName;
	rec.solution_name = solutionName;

	saveRecord(rec);
	
	return new Property(rec);
}

/**
 * Gets the property with the given name space or creates one if not found
 * 
 * @param propertyKey
 * @param propertyType
 * @param [solutionName]
 * @param [tenantName]
 * @param [userName]
 * @param [propertyValue]
 * 
 * @return {Property}
 * @private  
 * 
 * throws an exception if multiple properties are found matching parameters values
 *
 * @properties={typeid:24,uuid:"61F0F863-A1D0-4B21-944D-63DEAC9B8FA7"}
 */
function getOrCreateProperty(propertyKey, propertyType, solutionName, tenantName, userName, propertyValue) {
	var property = getProperty(propertyKey, propertyType, tenantName, userName, solutionName);
	if (!property) {
		return createProperty(propertyKey, propertyType, propertyValue, solutionName, tenantName, userName);
	} else {
		return property;
	}
}

/**
 * Returns the Property with the given property UUID
 * @param {UUID|String} propertyId the UUID of the property (as UUID or as a UUIDString)
 * 
 * @return {Property}
 * @private  
 *
 * @properties={typeid:24,uuid:"84BA0C4F-0953-4228-9CC4-548E891B7AB0"}
 */
function getPropertyById(propertyId) {
    if (propertyId instanceof String) {
        /** @type {String} */
        var propertyString = propertyId;
        propertyId = application.getUUID(propertyString);
    }
    
    var fs = datasources.db.svy_security.svy_properties.getFoundSet();
    fs.loadRecords(propertyId);
    
    if (utils.hasRecords(fs)) {
    	return new Property(fs.getSelectedRecord());
    } else {
    	return null;
    }
}

/**
 * Returns all properties with the given key and type, optional tenant and user name<br>
 * 
 * If tenantName is not provided, it will not be queried; if a null value is provided, only global properties are returned<br>
 * If userName is not provided, it will not be queried; if a null value is provided, only tenant wide properties are returned<br>
 * 
 * @param {String} propertyKey can contain % placeholders for like searches
 * @param {String} [propertyType] has to match exactly
 * @param {String} [tenantName] has to match exactly
 * @param {String} [userName] has to match exactly
 * @param {String} [solutionName] has to match exactly
 * 
 * @return {Array<Property>}
 * @public 
 *
 * @properties={typeid:24,uuid:"7F95F54F-D932-4226-AA75-60841D07CBF4"}
 */
function getProperties(propertyKey, propertyType, tenantName, userName, solutionName) {
	if ((propertyKey == null || propertyKey == undefined)) {
		throw new Error("propertyKey required");
	}
	
	if (arguments.length <= 2) {
		//tenant not given - will be ignored
		tenantName = IGNORE_PARAMETER;
	}
	if (arguments.length <= 3) {
		//user not given - will be ignored
		userName = IGNORE_PARAMETER;
	}
	if (arguments.length <= 4) {
		//solution not given - will be ignored
		solutionName = IGNORE_PARAMETER;
	}
	
	return loadProperties(propertyKey, propertyType, tenantName, userName, solutionName);
}

/**
 * Returns all properties of the given type, optional tenant and user name<br>
 * 
 * If tenantName is not provided, it will not be queried; if a null value is provided, only global properties are returned<br>
 * If userName is not provided, it will not be queried; if a null value is provided, only tenant wide properties are returned<br>
 * 
 * @param {String} propertyType has to match exactly
 * @param {String} [tenantName] has to match exactly
 * @param {String} [userName] has to match exactly
 * @param {String} [solutionName] has to match exactly
 * 
 * @return {Array<Property>}
 * @public 
 *
 * @properties={typeid:24,uuid:"82C26D51-AD85-47DD-98D6-7CE2B8449EF0"}
 */
function getPropertiesByType(propertyType, tenantName, userName, solutionName) {
	if ((propertyType == null || propertyType == undefined)) {
		throw new Error("propertyType required");
	}
	
	if (arguments.length <= 1) {
		//tenant not given - will be ignored
		tenantName = IGNORE_PARAMETER;
	}
	if (arguments.length <= 2) {
		//user not given - will be ignored
		userName = IGNORE_PARAMETER;
	}
	if (arguments.length <= 3) {
		//solution not given - will be ignored
		solutionName = IGNORE_PARAMETER;
	}
	
	return loadProperties(null, propertyType, solutionName, tenantName, userName);
}

/**
 * @param {String} propertyKey
 * @param {String} propertyType
 * @param {String} solutionName will not be queried if IGNORE_PARAMETER, else will ask for exact match or is null
 * @param {String} tenantName will not be queried if IGNORE_PARAMETER, else will ask for exact match or is null
 * @param {String} userName will not be queried if IGNORE_PARAMETER, else will ask for exact match or is null
 * 
 * @return {Array<Property>}
 * 
 * @private 
 *
 * @properties={typeid:24,uuid:"4CCA87D6-FC62-442B-9F66-A17DD48BBAF7"}
 */
function loadProperties(propertyKey, propertyType, solutionName, tenantName, userName) {
	var query = datasources.db.svy_security.svy_properties.createSelect();
	query.result.addPk();
	
	if (propertyKey) {
		if (propertyKey.indexOf("%") > -1) {
			query.where.add(query.columns.property_namespace.like(propertyKey));
		} else {
			query.where.add(query.columns.property_namespace.eq(propertyKey));
		}
	}
	
	if (propertyType) {
		query.where.add(query.columns.property_type.eq(propertyType));
	}
	
	if (tenantName !== IGNORE_PARAMETER) {
		if (!tenantName) {
			query.where.add(query.columns.tenant_name.isNull);
		} else {
			query.where.add(query.columns.tenant_name.eq(tenantName));			
		}
	}
	
	if (userName !== IGNORE_PARAMETER) {
		if (!userName) {
			query.where.add(query.columns.user_name.isNull);
		} else {
			query.where.add(query.columns.user_name.eq(userName));			
		}
	}
	
	if (solutionName !== IGNORE_PARAMETER) {
		if (!solutionName) {
			query.where.add(query.columns.solution_name.isNull);
		} else {
			query.where.add(query.columns.solution_name.eq(solutionName));			
		}
	}
	
	var fsProperties = datasources.db.svy_security.svy_properties.getFoundSet();
	fsProperties.loadRecords(query);
	var result = [];
	
	for (var i = 1; i <= fsProperties.getSize(); i++) {
		var record = fsProperties.getRecord(i);
		result.push(new Property(record));
	}
	
	return result;
}

/**
 * Immediately and permanently deletes the specified property.
 * @note USE WITH CAUTION! There is no undo for this operation.
 *
 * @public
 * @param {Property|UUID|String} property The property object or the UUID (UUID or UUID as String) of the property to delete.
 * @return {Boolean} False if property could not be deleted.
 * @properties={typeid:24,uuid:"416DAE0D-25B4-485F-BDB9-189B151EA1B9"}
 * @AllowToRunInFind
 */
function deleteProperty(property) {
    if (!property) {
        throw 'Property cannot be null';
    }
    
    /** @type {Property} */
    var prop;
    if (property instanceof String) {
        /** @type {String} */
        var propertyString = property;
        prop = getPropertyById(application.getUUID(propertyString));
    } else if (property instanceof UUID) {
        /** @type {UUID} */
        var propertyUUID = property;
        prop = getPropertyById(propertyUUID);
    } else {
    	prop = property;
    }

    if (!prop) {
        log.error('Could not delete property because it could not be found.');
        return false;
    }

    try {
        return prop.deleteProperty();
    } catch (e) {
    	log.error(utils.stringFormat('Could not delete property. Unkown error: %2$. Check log.', [e.message]));
        throw e;
    }
}

/**
 * @private
 * @param {String} text the text to validate
 * @param {Number} maxLength the max length allowed for the name; default=50
 * @return {Boolean}
 * @properties={typeid:24,uuid:"A91BA0E3-7F91-4C69-959B-9DBB06882825"}
 */
function textLengthIsValid(text, maxLength) {
	if (!maxLength) {
		maxLength = 50;
	}
	if (!text) {
		return true;
	}
	if (text && text.length <= maxLength) {
		return true;
	}
	return false;
}

/**
 * Gets the version of this module
 * @public 
 * @return {String} the version of the module using the format Major.Minor.Revision
 * @properties={typeid:24,uuid:"DC6A8292-F403-4E21-870D-C58F29517C7D"}
 */
function getVersion() {
    return application.getVersionInfo()['svyProperties'];
}

/**
 * TODO can i move these in a common module !?
 * Utility to save record with error thrown
 * @private
 * @param {JSRecord} record
 *
 * @properties={typeid:24,uuid:"B3DA359B-3EB5-4461-80D8-C7CC203E1BCF"}
 */
function saveRecord(record) {
	var startedLocalTransaction = false;

	if (databaseManager.hasTransaction()) {
		if (!supportExternalDBTransaction) {
			throw new Error('External database transactions are not allowed.');
		}
	} else {
		startedLocalTransaction = true;
		databaseManager.startTransaction();
	}

	try {
		if (!databaseManager.saveData(record)) {
			throw new Error('Failed to save record ' + record.exception);
		}
		if (startedLocalTransaction) {
			if (!databaseManager.commitTransaction(false, false)) {
				throw new Error('Failed to commit database transaction.');
			}
		}
	} catch (e) {
		log.error('Record could not be saved due to the following: "{}" Rolling back database transaction.', e.message);
		databaseManager.rollbackTransaction();
		record.revertChanges();
		throw e;
	}
}

/**
 * Utility to delete record with errors thrown
 * @private
 * @param {JSRecord} record
 * @return {Boolean}
 *
 * @properties={typeid:24,uuid:"8A2071D7-F4ED-40D7-8285-B3B206DB74CE"}
 */
function deleteRecord(record) {
    var startedLocalTransaction = false;

    if (databaseManager.hasTransaction()) {
        if (!supportExternalDBTransaction) {
            throw new Error('External database transactions are not allowed.');
        }
    } else {
        startedLocalTransaction = true;
        databaseManager.startTransaction();
    }

    try {
        if (!record.foundset.deleteRecord(record)) {
            throw new Error('Failed to delete record.');
        }
        if (startedLocalTransaction) {
            if (!databaseManager.commitTransaction(true, true)) {
                throw new Error('Failed to commit database transaction.');
            }
        }
    } catch (e) {
    	log.error('Record could not be deleted due to the following: {} Rolling back database transaction.', e.message);
        databaseManager.rollbackTransaction();
        throw e;
    }
    
    return true;
}

/**
 * Initializes the scope.
 * NOTE: This var must remain at the BOTTOM of the file.
 * @private
 * @SuppressWarnings (unused)
 * @properties={typeid:35,uuid:"2F61DF4C-81DC-4ECF-BB8E-5E4681DFD387",variableType:-4}
 */
var init = (function() {
	var propertiesTable = datasources.db.svy_security.svy_properties.getTable();
	
	// set MAX values based on column length
	MAX_TENANTNAME_LENGTH = propertiesTable.getColumn('tenant_name').getLength();
	MAX_SOLUTION_NAME_LENGTH = propertiesTable.getColumn('solution_name').getLength();
	MAX_USERNAME_LENGTH = propertiesTable.getColumn('user_name').getLength();
	MAX_NAMESPACE_LENGTH = propertiesTable.getColumn('property_namespace').getLength();
	MAX_TYPE_LENGTH = propertiesTable.getColumn('property_type').getLength();
	MAX_VALUE_LENGTH = propertiesTable.getColumn('property_value').getLength();
	MAX_DISPLAYNAME_LENGTH = propertiesTable.getColumn('display_name').getLength();
	
	initProperty();
})();