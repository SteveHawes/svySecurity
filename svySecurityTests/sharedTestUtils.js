/**
 * This will store the original Servoy security when using mockup so it can be restored at the end of the test
 * @private 
 * @properties={typeid:35,uuid:"D7D37304-5A07-4F2B-AFF7-A0C2AABAA748",variableType:-4}
 */
var m_OriginalServoySecurity = null;

/**
 * @private 
 * @type {JSDataSet}
 * @properties={typeid:35,uuid:"0D6142ED-3DF9-4071-B6EF-95967CD0E9E5",variableType:-4}
 */
var m_OriginalServoySecurityGroypsDS = null;

/**
 * use to setup all tests
 * @public 
 * @properties={typeid:24,uuid:"81B19C1A-36D5-4E57-80AF-B4040AA4F178"}
 */
function setUp(){
    application.output('setting up');
    //configure the svySecurity module to use the external transactions 
    scopes.svySecurity.changeExternalDBTransactionSupportFlag(true);
    //do everything in a transaction which is rolled back at the end to clean up test data
    databaseManager.startTransaction();
}

/**
 * use to tear down all tests
 * @public 
 * @properties={typeid:24,uuid:"355315ED-7E0A-498E-A64E-4FDC529C7438"}
 */
function tearDown() {
    application.output('tearing down');
    if (databaseManager.hasTransaction()){
        databaseManager.rollbackTransaction();
    }
}

/**
 * Expects <b>block</b> to throw an <b>error</b>
 * @public
 * @param {Function} block is usually a function expression that wraps a code to be tested
 * @param {Array<*>} [argsArr]
 * @param {String} [expectedErrMsg]
 * @param {String} [message] the message to use if the assertion fails
 *
 * @properties={typeid:24,uuid:"D4257899-61DD-4023-B4FF-769D4E3B0FFF"}
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

/**
 * Substitutes functions implementation for the time when the block is executed.
 * Replaces back the original functions when the block finishes.
 * @public
 * @param {Array<FunctionDescriptor>} functions functions description
 * @param {Function} block block code to execute with substituted function.
 * @param {Array<*>} [blockArgs]
 *
 * @properties={typeid:24,uuid:"5D7608B3-DE8B-4250-A450-B0E41853F196"}
 */
function substituteFunctionImplementation(functions, block, blockArgs) {
    for (var i = 0; i < functions.length; i++) {
        var descriptor = functions[i];
        descriptor.object[descriptor.originalFunctionName] = descriptor.functionToUse;
    }
    try {
        blockArgs = blockArgs || [];
        block(blockArgs);
    } finally {
        for (i = 0; i < functions.length; i++) {
            descriptor = functions[i];
            descriptor.object[descriptor.originalFunctionName] = descriptor.originalFunction;
        }
    }
}

/**
 * Used with substituteFunctionImplementation
 * @constructor
 * @public
 * @param object Object containing the original function.
 * @param {String} originalFunctionName
 * @param {Function} originalFunction
 * @param {Function} functionToUse function to replace with
 *
 * @properties={typeid:24,uuid:"386DEBC7-30E1-46E3-832C-1F7907ED7409"}
 */
function FunctionDescriptor(object, originalFunctionName, originalFunction, functionToUse) {
    this.object = object;
    this.originalFunction = originalFunction;
    this.functionToUse = functionToUse;
    this.originalFunctionName = originalFunctionName;
}

/**
 * @public 
 * @param {Array<String>} groupsToAdd the group to add to return value from security.getGroups
 * @param {String} currentUserUID the value to return from security.getUserUID
 * @param {Boolean} loginResult the value to return from security.login
 * @return {Object}
 *
 * @properties={typeid:24,uuid:"6CC0845D-2ECE-4B85-800B-B392BFF5B157"}
 */
function getMockupSecurity(groupsToAdd, currentUserUID, loginResult) {
    if (!m_OriginalServoySecurity) {
        m_OriginalServoySecurity = security;
        m_OriginalServoySecurityGroypsDS = security.getGroups();
    }
    
    //build a mockup security object with the methods used by svySecurity
    var mockupSecurity = {
        getGroups: function() {
            application.output('Called mockupSecurity.getGroups');
            var ds = databaseManager.createEmptyDataSet(0, 2);
            
            var grpNames = m_OriginalServoySecurityGroypsDS.getColumnAsArray(2);
            for(var i in grpNames){
                ds.addRow([grpNames[i], grpNames[i]]);
            }
            
            //this will "add" an extra security groups
            if (groupsToAdd) {
                for (var k in groupsToAdd) {
                    ds.addRow([groupsToAdd[k], groupsToAdd[k]]);
                }
            }
            return ds;
        },
    
        getUserUID: function() {
            application.output('Called mockupSecurity.getUserUID');
            return currentUserUID; 
        },
        
        getClientID: function() {
            application.output('Called mockupSecurity.getClientID');
            return application.getUUID().toString();
        },
        
        login: function() {
            application.output('Called mockupSecurity.login');
            return loginResult;
        },
        
        logout: function() {
            application.output('Called mockupSecurity.logout');            
        }
    };
    
    return mockupSecurity;
}

/**
 * IMPORTANT
 * @public 
 * @param mockupSecurity
 *
 * @properties={typeid:24,uuid:"B6CA88D6-E440-404F-A17C-25BE35877244"}
 */
function setMockupSecurity(mockupSecurity){
    if (!mockupSecurity){
        application.output('mockupSecurity not specified - security will not be changed',LOGGINGLEVEL.ERROR); 
        return;
    }
    
    if (!m_OriginalServoySecurity) {
        m_OriginalServoySecurity = security;
        m_OriginalServoySecurityGroypsDS = security.getGroups();
    }
    application.output('Substituting original Servoy security with mockup');
    security = mockupSecurity;
}

/**
 * @public 
 * @properties={typeid:24,uuid:"1EACC1A1-B569-4BA0-88CD-234EF85D40CF"}
 */
function restoreServoySecurity() {
    if (m_OriginalServoySecurity){
        application.output('Restoring original Servoy security');
        security = m_OriginalServoySecurity;
    }
}
/**
 * Callback method for when solution is closed, force boolean argument tells if this is a force (not stoppable) close or not.
 *
 * @param {Boolean} force if false then solution close can be stopped by returning false
 *
 * @return {Boolean}
 *
 * @properties={typeid:24,uuid:"6010076C-939F-4D04-96D2-5C3198508331"}
 */
function onSolutionClose(force) {
    application.output('Closing unit test solution...');
    //just in case something was forgotten to be cleaned up
    tearDown();
    restoreServoySecurity();
    return true;
}
