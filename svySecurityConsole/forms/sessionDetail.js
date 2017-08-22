/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"5DA4ABDB-2F94-4C45-B838-0F7643B6C876"}
 */
var m_CallerTenantName = '';

/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"86C76458-755F-4727-BE17-DF5640C6D76F"}
 */
var m_CallerUserName = '';

/**
 * @private
 * @type {Boolean}
 * @properties={typeid:35,uuid:"A044625B-250F-44F4-B601-423AA7519C55",variableType:-4}
 */
var m_CallerActiveSessionsOnly = false;

/**
 * @protected
 * @type {String}
 *
 * @properties={typeid:35,uuid:"F4BB9733-9A45-46DA-BBCE-BD9A14614A48"}
 */
var m_GoogleAPIKey = null;

/**
 * @public
 * @param {JSFoundSet<db:/svy_security/sessions>} fs the foundset to display
 * @param {String} tenantName - used to invoke back the caller screen
 * @param {String} userName - used to invoke back the caller screen
 * @param {Boolean} activeSessionsOnly - used to invoke back the caller screen
 *
 * @properties={typeid:24,uuid:"D86F84BD-E42C-4089-8660-39A2FC762221"}
 */
function show(fs, tenantName, userName, activeSessionsOnly) {
    m_CallerTenantName = tenantName;
    m_CallerUserName = userName;
    m_CallerActiveSessionsOnly = activeSessionsOnly;
    controller.loadRecords(fs);

    showIPGeolocation(foundset.ip_address);

    application.getWindow().show(this);
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"C1A8F74E-95D6-433B-B5ED-39FD94061B03"}
 */
function onShow(firstShow, event) {
    setHeaderText(utils.stringFormat('<span class="fa fa-info-circle"></span> Session Information For User [%1$s]', [user_name]));
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"9E331313-2F3F-4810-8CE1-DE213202DBE9"}
 */
function onActionShowSessionsList(event) {
    if (m_CallerActiveSessionsOnly) {
        if (m_CallerUserName) {
            forms.sessionsList.showUserActiveSessions(m_CallerTenantName, m_CallerUserName);
        } else if (m_CallerTenantName) {
            forms.sessionsList.showTenantActiveSessions(m_CallerTenantName);
        } else {
            forms.sessionsList.showAllActiveSessions();
        }
    } else {
        if (m_CallerUserName) {
            forms.sessionsList.showUserSessions(m_CallerTenantName, m_CallerUserName);
        } else if (m_CallerTenantName) {
            forms.sessionsList.showTenantSessions(m_CallerTenantName);
        } else {
            forms.sessionsList.showAllSessions();
        }
    }
}

/**
 * @private
 * @param {String} ipAddress
 *
 * @properties={typeid:24,uuid:"6FFB3A93-B89E-41EC-8B43-34B1BA1A5E01"}
 */
function showIPGeolocation(ipAddress) {
    var lat, lon;
    var mapInfo = 'Cannot resolve IP location';
    m_GoogleAPIKey = application.getUserProperty('GoogleAPIKey');

    elements.svyGMap.latitude = null;
    elements.svyGMap.longitude = null;
    try {
        //var dataStr = plugins.http.getPageData(utils.stringFormat('http://freegeoip.net/json/%1$s', [ipAddress]));
        ///** @type {{latitude: String, longitude: String}} */
        //var data = JSON.parse(dataStr);
        //lat = data.latitude;
        //lon = data.longitude;

        var dataStr = plugins.http.getPageData(utils.stringFormat('http://ip-api.com/json/%1$s', [ipAddress]));
        /** @type {{lat: String, lon: String}} */
        var data = JSON.parse(dataStr);
        lat = data.lat;
        lon = data.lon;

        if ( (lat != null) && (lon != null)) {
            elements.svyGMap.latitude = lat;
            elements.svyGMap.longitude = lon;
            if (!m_GoogleAPIKey) {
                mapInfo = 'Property "user.GoogleAPIKey" is not set.';
            } else {
                mapInfo = null;
            }
        }
    } catch (ex) {
        application.output('IP geolocation request failed: ' + ex);
        mapInfo = 'IP geolocation request failed.'
    }

    if (mapInfo) {
        elements.lblMapInfo.text = mapInfo;
        elements.lblMapInfo.visible = true;
    } else {
        elements.lblMapInfo.visible = false;
    }
}
