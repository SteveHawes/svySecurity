/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"D159D5CE-6748-4DBC-AC25-523B8475FBCD"}
 */
var SVY_PROPERTIES_VERSION = '1.0.0';

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"F45AB1DC-D4F8-4304-AFE5-0F6206F04BC4",variableType:4}
 */
var MAX_TEXT_LENGTH = 50;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"08287BA8-C3FE-46A0-A801-382F605A33FE",variableType:4}
 */
var MAX_NAMESPACE_LENGTH = 500;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"91FC2B4E-B761-4A8A-A3E2-E59F5886D498",variableType:4}
 */
var MAX_VALUE_LENGTH = 50000000;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"C6CE548F-4176-410E-8E91-1C0DABD22178",variableType:4}
 */
var MAX_DISPLAYNAME_LENGTH = 500;

/**
 * @private
 * @properties={typeid:35,uuid:"49CEE483-8E4C-4EA3-B0B6-43276C956D47",variableType:-4}
 */
var log = scopes.svyLogManager.getLogger("com.servoy.svyproperties");

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
 * @private
 * @param {Boolean} mustSupportExternalTransactions The value for the supportExternalDBTransaction flag to set.
 *
 *
 * @properties={typeid:24,uuid:"E96349F8-049D-412F-B4E6-B8B8C7BAB3C6"}
 */
function changeExternalDBTransactionSupportFlag(mustSupportExternalTransactions) {
	if (databaseManager.hasTransaction()) {
		throw new Error('The external DB transaction support flag can be changed only while a DB transaction is not in progress.');
	}
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
	
	/** 
	 * @protected 
	 * @type {JSRecord<db:/svy_security/svy_properties>} 
	 * */
	this.record = record;
	
	if (!record) {
		throw new Error('Property record is not specified');
	}
	
    /**
     * Gets the property uuid for this property.
     *
     * @public
     * @return {UUID} The property uuid of this property.
     */
    this.getPropertyUUID = function() {
        return record.property_uuid;
    }
	
    /**
     * Gets the display name for this property.
     *
     * @public
     * @return {String} The property value of this property. Can be null if a display name is not set.
     */
    this.getDisplayName = function() {
        return record.display_name;
    }
    
    /**
     * Sets the property display name for this property.
     *
     * @public
     * @return {Property} The property uuid of this property.
     */
    this.setDisplayName = function(displayName) {
    	if (!textLengthIsValid(displayName, MAX_DISPLAYNAME_LENGTH)) {
    		throw new Error(utils.stringFormat('DisplayName must be between 1 and %1$s characters long.', [MAX_DISPLAYNAME_LENGTH]));
    	}
        record.display_name = displayName;
        saveRecord(record);
        return this;
    }
	
    /**
     * Gets the property value for this property.
     *
     * @public
     * @return {String} The property value of this property. Can be null if a property value is not set.
     */
    this.getPropertyValue = function() {
        return record.property_value;
    }

    /**
     * Sets the property value for this property.
     * 
     * @public
     * @param {String} propertyValue 
     * @return {Property} This property for call-chaining support.
     */
    this.setPropertyValue = function(propertyValue) {
    	
    	if (!textLengthIsValid(propertyValue, MAX_VALUE_LENGTH)) {
    		throw new Error(utils.stringFormat('PropertyValue must be between 0 and %1$s characters long.', [MAX_VALUE_LENGTH]));
    	}
    	
        record.property_value = propertyValue;
        saveRecord(record);
        return this;
    }
    
    /**
     * Gets the display name for this property.
     *
     * @public
     * @return {String} The property value of this property. Can be null if a display name is not set.
     */
    this.getTenantName = function() {
        return record.tenant_name;
    }
	
}

/**
 * @param propertyNameSpace
 * @param propertyValue
 * @param [propertyType]
 * @param [tenantName]
 * @param [userName]
 * 
 * @return {Property}
 * @public 
 * 
 * @throws {Error, scopes.svyDataUtils.ValueNotUniqueException}
 *
 * @properties={typeid:24,uuid:"08D8D77A-FC88-453D-A9CA-9B320A9CF2F3"}
 */
function createProperty(propertyNameSpace, propertyValue, propertyType, tenantName, userName) {
	if (!propertyNameSpace) {
		throw new Error('PropertyName name cannot be null or empty');
	}

	if (!textLengthIsValid(propertyNameSpace, MAX_NAMESPACE_LENGTH)) {
		throw new Error(utils.stringFormat('PropertyNameSpace must be between 0 and %1$s characters long.', [MAX_NAMESPACE_LENGTH]));
	}

	if (!textLengthIsValid(propertyValue, MAX_VALUE_LENGTH)) {
		throw new Error(utils.stringFormat('PropertyValue must be between 0 and %1$s characters long.', [MAX_VALUE_LENGTH]));
	}

	if (!textLengthIsValid(propertyType, MAX_TEXT_LENGTH)) {
		throw new Error(utils.stringFormat('PropertyType must be between 1 and %1$s characters long.', [MAX_TEXT_LENGTH]));
	}

	if (!textLengthIsValid(tenantName, MAX_TEXT_LENGTH)) {
		throw new Error(utils.stringFormat('TenantName must be between 1 and %1$s characters long.', [MAX_TEXT_LENGTH]));
	}

	if (!textLengthIsValid(userName, MAX_TEXT_LENGTH)) {
		throw new Error(utils.stringFormat('UserName must be between 1 and %1$s characters long.', [MAX_TEXT_LENGTH]));
	}

	var fs = datasources.db.svy_security.svy_properties.getFoundSet();

	// Check if value is unique values
	var fsExists = scopes.svyDataUtils.getFoundSetWithExactValues(fs.getDataSource(), ["property_namespace", "property_type", "tenant_name", "user_name"], [propertyNameSpace, propertyType, tenantName, userName]);
	if (fsExists.getSize()) {
		// return the exception here !?
		throw new scopes.svyDataUtils.ValueNotUniqueException("There is already a property for values", fsExists);
	}

	var rec = fs.getRecord(fs.newRecord(false, false));
	rec.property_namespace = propertyNameSpace;
	rec.property_type = propertyType;
	rec.property_value = propertyValue;
	rec.tenant_name = tenantName;
	rec.user_name = userName;

	saveRecord(rec)
	var property = new Property(rec);
	return property;
}

/**
 * @param propertyNameSpace
 * @param [propertyType]
 * @param [tenantName]
 * @param [userName]
 * 
 * @return {Property}
 * @public 
 * 
 * throws an exception if multiple properties are found matching parameters values
 *
 * @properties={typeid:24,uuid:"61F0F863-A1D0-4B21-944D-63DEAC9B8FA7"}
 */
function getOrCreateProperty(propertyNameSpace, propertyType, tenantName, userName) {
	// Check if value is unique values
	/** @type {JSFoundSet<db:/svy_security/svy_properties>} */
	var fsExists = scopes.svyDataUtils.getFoundSetWithExactValues(datasources.db.svy_security.svy_properties.getDataSource(), ["property_namespace", "property_type", "tenant_name", "user_name"], [propertyNameSpace, propertyType, tenantName, userName]);
	if (fsExists.getSize() == 1) {
		return new Property(fsExists.getRecord(1));
	} else if (fsExists.getSize() > 1) {
		throw "Case not handled yet, what is expected to happen here ?!"
	} else {
		return createProperty(propertyNameSpace, null, propertyType, tenantName, userName);
	}
}

/**
 * Returns the Property with the given propertyUUID
 * @param {UUID|String} propertyUUID the UUID of the property (as UUID or as a UUIDString)
 * 
 * @return {Property}
 * @public 
 *
 * @properties={typeid:24,uuid:"84BA0C4F-0953-4228-9CC4-548E891B7AB0"}
 */
function getProperty(propertyUUID) {
    if (propertyUUID instanceof String) {
        /**
         * @type {String}
         * @private
         */
        var propertyString = propertyUUID;
        propertyUUID = getProperty(application.getUUID(propertyString));
    }
	
	/** @type {JSRecord<db:/svy_security/svy_properties>} */
	var rec = scopes.svyDataUtils.getRecord(datasources.db.svy_security.svy_properties.getDataSource(),[propertyUUID]);
	if (rec) {
		return new Property(rec)
	} else {
		// TODO shall i throw an exception here ?
		return null;
	}
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
    if (property instanceof String) {
        /**
         * @type {String}
         * @private
         */
        var propertyString = property;
        property = getProperty(application.getUUID(propertyString));
    }
    if (property instanceof UUID) {
        /**
         * @type {UUID}
         * @private
         */
        var propertyUUID = property;
        property = getProperty(propertyUUID);
    }

    // get foundset
    var fs = datasources.db.svy_security.svy_properties.getFoundSet();
    var qry = datasources.db.svy_security.svy_properties.createSelect();
    qry.where.add(qry.columns.property_uuid.eq(property.getPropertyUUID()));
    fs.loadRecords(qry);

    if (fs.getSize() == 0) {
        log.error('Could not delete tenant. Could not find property {}.', property.getPropertyUUID());
        return false;
    }

    try {
        deleteRecord(fs.getRecord(1));
        return true;
    } catch (e) {
    	log.error(utils.stringFormat('Could not delete tenant %1$. Unkown error: %2$. Check log.', [property.getPropertyUUID(), e.message]));
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
    return SVY_PROPERTIES_VERSION;
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
		log.debug('Detected external database transaction.');
		if (!supportExternalDBTransaction) {
			throw new Error('External database transactions are not allowed.');
		}
	} else {
		startedLocalTransaction = true;
		log.debug('Starting internal database transaction.');
		databaseManager.startTransaction();
	}

	try {
		if (!databaseManager.saveData(record)) {
			throw new Error('Failed to save record ' + record.exception);
		}
		if (startedLocalTransaction) {
			log.debug('Committing internal database transaction.');
			if (!databaseManager.commitTransaction(true, true)) {
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
 *
 * @properties={typeid:24,uuid:"8A2071D7-F4ED-40D7-8285-B3B206DB74CE"}
 */
function deleteRecord(record) {
    var startedLocalTransaction = false;

    if (databaseManager.hasTransaction()) {
        log.debug('Detected external database transaction.');
        if (!supportExternalDBTransaction) {
            throw new Error('External database transactions are not allowed.');
        }
    } else {
        startedLocalTransaction = true;
        log.debug('Starting internal database transaction.');
        databaseManager.startTransaction();
    }

    try {
        if (!record.foundset.deleteRecord(record)) {
            throw new Error('Failed to delete record.');
        }
        if (startedLocalTransaction) {
        	log.debug('Committing internal database transaction.');
            if (!databaseManager.commitTransaction(true, true)) {
                throw new Error('Failed to commit database transaction.');
            }
        }
    } catch (e) {
    	log.error('Record could not be deleted due to the following: {} Rolling back database transaction.', e.message);
        databaseManager.rollbackTransaction();
        throw e;
    }
}




/**
 * Initializes the module.
 * NOTE: This var must remain at the BOTTOM of the file.
 * @private
 * @SuppressWarnings (unused)
 * @properties={typeid:35,uuid:"AA79B112-EACF-4094-83A9-9C121DE8F7E6",variableType:-4}
 */
var init = function() {
//	setupSecurityProperties();
}();
