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