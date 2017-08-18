/*
 * This scope contains helper/utility methods for various tasks.
 */

/**
 * @private
 * @param {String} message
 * @param {Number} level - one of the LOGGINGLEVEL constants
 *
 * @properties={typeid:24,uuid:"A89E3844-E9E0-477F-93CE-E97FB6D82B8B"}
 */
function log(message, level) {
    //override this to provide custom logging
    application.output('[source: svySecurityConsole] ' + message, level);
}

/**
 * @public
 * @param {String} message
 * @properties={typeid:24,uuid:"4BAA0E41-EFFA-4FCA-ABD4-56404ECA2518"}
 */
function logDebug(message) {
    log(message, LOGGINGLEVEL.DEBUG);
}

/**
 * @public
 * @param {String} message
 * @properties={typeid:24,uuid:"E0C177EB-BFF6-4FFD-8421-D4C26D6626D4"}
 */
function logInfo(message) {
    log(message, LOGGINGLEVEL.INFO);
}

/**
 * @public
 * @param {String} message
 * @properties={typeid:24,uuid:"9B8A15D7-D3D3-4888-932F-42B99642AB13"}
 */
function logWarning(message) {
    log(message, LOGGINGLEVEL.WARNING);
}

/**
 * @public
 * @param {String} message
 * @properties={typeid:24,uuid:"A230C879-4B1A-48CE-A65E-7DD3D4029ED2"}
 */
function logError(message) {
    log(message, LOGGINGLEVEL.ERROR);
}

/**
 * @public
 * @param {String} context
 * @param {ServoyException|Error} exception
 * @properties={typeid:24,uuid:"F714380F-B277-4A12-8054-95A2D6C9698F"}
 */
function logException(context, exception) {
    var exceptionText = scopes.svySecurityConsoleHelper.getExceptionText(exception); 
    var errorInfo = [exceptionText];
    if (exception instanceof ServoyException) {
        /** @type {ServoyException} */
        var servoyException = exception;

        errorInfo.push('');
        errorInfo.push('The error is ServoyException');
        errorInfo.push('Error Code: ' + servoyException.getErrorCode());

        if (servoyException.getStackTrace) {            
            errorInfo.push('Stack Trace: ' + servoyException.getStackTrace());
        }

        var failedRecordsErrors = scopes.svySecurityConsoleHelper.getFailedRecordsErrors();
        if (failedRecordsErrors) {
            errorInfo.push('');
            errorInfo.push('Additional error information:');
            errorInfo.push(failedRecordsErrors);
        }
    }

    logError(utils.stringFormat('[context: %1$s] %2$s',[context, errorInfo.join('\n')]));
}

/**
 * @public
 * @param {Error|ServoyException|String} exception the error/exception object containing the error text
 * @return {String} the exception error text
 *
 * @properties={typeid:24,uuid:"B3FE1D82-7087-44A8-AEA0-4D0F33B56C29"}
 */
function getExceptionText(exception) {
    var msg = '';

    if (exception instanceof Error) {
        msg = exception.message;
    } else if (exception instanceof ServoyException) {
        msg = exception.getMessage();
    } else {
        msg = '' + exception;
    }
    return msg;
}

/**
 * This function uses databaseManager.getFailedRecords() to get all failed records and returns
 * the collected errors info
 * @public
 * @return {String} the collected errors from all failed records or null if no errors were found
 *
 * @properties={typeid:24,uuid:"FB6A224A-F51C-4317-8DD3-BD81A451C575"}
 */
function getFailedRecordsErrors() {
    var failedRecords = databaseManager.getFailedRecords();
    if (failedRecords && failedRecords.length > 0) {
        var errors = '';
        for (var indx = 0; indx < failedRecords.length; indx++) {
            var rec = failedRecords[indx];
            var tableName = databaseManager.getTable(rec).getSQLName();
            var ex = rec.exception;
            if (!ex) {
                continue;
            }

            var validationError = null;
            if (ex instanceof DataException) {
                /** @type {DataException} */
                var dataEx = ex;
                validationError = dataEx.getValue();
            }

            if (validationError) {
                errors = utils.stringFormat('%1$s - [%2$s] %3$s', [errors, tableName, '' + validationError]);
            } else if (ex.getMessage && ex.getMessage()) {
                errors = utils.stringFormat('%1$s - [%2$s] %3$s', [errors, tableName, ex.getMessage()]);
            } else {
                errors = utils.stringFormat('%1$s - [%2$s] %3$s', [errors, tableName, ex]);
            }
        }
        return errors;
    }
    return null;
}


/**
 * @public 
 * @param {Number} duration in milliseconds
 * @return {String}
 *
 * @properties={typeid:24,uuid:"BFACA190-DC4B-468A-8F27-38468E1934D1"}
 */
function convertDurationToStr(duration) {
    //return duration in format like "5h 15m 43s"
    duration = duration || 0;
    var durationHrs = Math.floor(duration / 3600000);
    var durationMin = Math.floor((duration - (durationHrs * 3600000)) / 60000);
    var durationSec = Math.floor((duration - (durationHrs * 3600000) - (durationMin * 60000)) / 1000);
    var res = null;
    if (durationSec || (!durationHrs && !durationMin)) {
        res = durationSec + 's';
    }
    if (durationMin || (durationSec && durationHrs)) {
        res = durationMin + 'm' + (res ? ' ' + res : ''); 
    }
    if (durationHrs) {
        res = durationHrs + 'h' + (res ? ' ' + res : ''); 
    }
    return res;
}