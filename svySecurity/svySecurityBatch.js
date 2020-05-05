/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"F22F523D-E4ED-4571-871B-001E801EBBA6"}
 */
var FLAG_CLEAN_SESSIONS_IN_DEVELOPER = 'cleanSessionsInDeveloper';

/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"6EAC5907-3538-4BF4-95F6-F8806045712D"}
 */
var FLAG_CLEAN_SESSION_IN_CLUSTER = 'cleanSessionsInCluster';

/**
 * Job timings: every minute
 * 
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"B4E0F70B-1763-41D6-806D-05FFE43E8FAF"}
 */
var BATCH_INTERVAL = '0 0/1 * * * ?';

/**
 * Job timings: every minute
 * 
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"9719E1A4-72CD-4606-B256-E725A97CB413"}
 */
var SERVER_BATCH_INTERVAL = '0/2 * * * * ?';

/**
 * @type {String}
 * @private 
 * @properties={typeid:35,uuid:"8E386A49-AEC8-4B7D-BD19-2F8BCF6E11B9"}
 */
var CLIENT_ID = 'com.servoy.extensions.svy-security.batch';

/**
 * @type {String}
 * @private 
 *
 * @properties={typeid:35,uuid:"1EB59DA6-00B5-4C5E-9A24-12EDF52DEECD"}
 */
var CLUSTER_CLIENT_ID = 'com.servoy.extensions.svy-security.serverbatch';

/**
 * @enum 
 * @private 
 * @properties={typeid:35,uuid:"983C52EE-A956-497B-AD36-C88E036E4B9D",variableType:-4}
 */
var CONFIGS = {
	SERVER_SESSION_TIMEOUT : 60
}

/**
 * Launches the batch processor in a headless client 
 * @public    
 * @properties={typeid:24,uuid:"C0E3D90A-C0E1-41B2-A20A-6770ACA2CB48"}
 */
function startBatch() {
	// clean sessions
	var cleanSessionsInDeveloper = application.getUserProperty(FLAG_CLEAN_SESSIONS_IN_DEVELOPER);
	if (application.isInDeveloper() && cleanSessionsInDeveloper === "true") {	
		plugins.headlessclient.getOrCreateClient(CLIENT_ID, 'svySecurity', null, null, [CLIENT_ID, "nodebug"]);
	} else if (!application.isInDeveloper()) {
		plugins.headlessclient.getOrCreateClient(CLIENT_ID, 'svySecurity', null, null, [CLIENT_ID]);
	}
	
	// clean sessions in cluster
	var cleanSessionsInCluster = application.getUserProperty(FLAG_CLEAN_SESSION_IN_CLUSTER);
	if (application.isInDeveloper() && cleanSessionsInDeveloper === "true" && cleanSessionsInCluster === "true" ) {	
		plugins.headlessclient.getOrCreateClient(CLUSTER_CLIENT_ID, 'svySecurity', null, null, [CLUSTER_CLIENT_ID, "nodebug"]);
	} else if (!application.isInDeveloper() && cleanSessionsInCluster === "true") {
		plugins.headlessclient.getOrCreateClient(CLUSTER_CLIENT_ID, 'svySecurity', null, null, [CLUSTER_CLIENT_ID]);
	}
}


/**
 * Schedules the session manager to cleanup abandoned batches
 * Should be called internally and only on startup 1x
 * @private  
 * @properties={typeid:24,uuid:"75CBB9BA-7FA9-45BA-B243-01E86E406DB5"}
 */
function scheduleSessionManager() {
	plugins.scheduler.addCronJob('updateSessions', BATCH_INTERVAL, updateOpenClientSessions);
	application.output('Session cleanup job scheduled', LOGGINGLEVEL.INFO);
}


/**
 * @private 
 * @properties={typeid:24,uuid:"86C7FC9B-DD23-4A1D-AAD3-B0BB2095610B"}
 * @AllowToRunInFind
 */
function updateOpenClientSessions() {

	// Check settings for how to handle abandoned sessions when running developer
	var cleanSessionsInDeveloper = application.getUserProperty(FLAG_CLEAN_SESSIONS_IN_DEVELOPER);
	var cleanSessionsInCluster = application.getUserProperty(FLAG_CLEAN_SESSION_IN_CLUSTER);
	if (application.isInDeveloper() && cleanSessionsInDeveloper !== "true") {
		application.output('Abandoned sessions will not be cleaned from Servoy Developer. Change setting {user.cleanSessionsInDeveloper=true} in servoy.properties to have them cleaned', LOGGINGLEVEL.DEBUG);
		return;
	}

	// GET IDS FOR ALL CONNECTED CLIENTS
	var clientIDs = [];
	var clients = plugins.clientmanager.getConnectedClients();
	for (var i in clients) {
		clientIDs.push(clients[i].getClientID());
	}
	
	var serverID = getServerID();
	var serverTimeout = CONFIGS.SERVER_SESSION_TIMEOUT;
	var lastPingTime = scopes.svyDateUtils.addSeconds(new Date(), - serverTimeout);
	
	// TODO do i need to flush ?
	// plugins.rawSQL.flushAllClientsCache("svy_security","session_servers");
	
	// FETCH ALL RECORDS W/ NULL END DATE WHICH DO NOT APPEAR IN CLIENT IDS LIST
	var q = datasources.db.svy_security.sessions.createSelect();
	q.result.addPk();
	
	// if session cluster enabled, check if other servers have crashed.
	if (cleanSessionsInCluster === "true") {
		/** @type {QBJoin<db:/svy_security/session_servers>} */
		var join = q.joins.add(datasources.db.svy_security.session_servers.getDataSource());
		join.on.add(join.columns.id.eq(q.columns.servoy_server_id));
		// sessions where serverID = myServerID or serverID is null
		// my sessions where clientID is not active in this server
		
		// any close sessions where server is inactive
		var or = q.or;
		or.add(q.columns.servoy_server_id.eq(serverID));  // serverID = MY serverID
		or.add(q.columns.servoy_server_id.isNull);		  // serverID IS NULL
		or.add(q.and.add(join.columns.last_server_ping.le(lastPingTime)).add(q.columns.servoy_server_id.not.eq(serverID)));  // SERVER.lastPing < serverPingTimeout & serverID != My ServerID
		
		var qsub = datasources.db.svy_security.session_servers.createSelect();
		qsub.result.addPk();
		qsub.where.add(qsub.columns.id.eq(q.columns.servoy_server_id));
		
		// search also for sessions where servoy_server_id is not in server_sessions table ?
		or.add(q.and.add(q.not(q.exists(qsub))).add(q.columns.servoy_server_id.not.eq(serverID)));
		
		// session where end is null AND not in []  and (( serverid = myID OR serverid is null) OR SERVER.lastPing < serverPingTimeout))
		q.where.add(or);
	
	}
	q.where.add(q.columns.session_end.isNull);
	q.where.add(q.columns.servoy_client_id.not.isin(clientIDs));	
	
	// TODO should use dataset instead !?
	
	// LOAD INTO A FOUNDSET
	var fs = datasources.db.svy_security.sessions.getFoundSet();
	fs.loadRecords(q);
	var sessionCount = fs.getSize();
	if (!sessionCount) {
		return
	}
	application.output('Found ' + sessionCount + ' abandoned session(s)', LOGGINGLEVEL.INFO);

	// UPDATE SESSIONS
	var now = application.getServerTimeStamp();
	for (var j = 1; j <= fs.getSize(); j++) {
		var session = fs.getRecord(j);
		session.session_end = now;
		session.session_duration = Math.min(Math.max(0, now.getTime() - session.session_start.getTime()), 2147483647);
		if (!databaseManager.saveData(session)) {
			application.output('Failed to update abandoned session: ' + session.servoy_client_id, LOGGINGLEVEL.ERROR);
			continue;
		}
		application.output('Closed abandoned session: ' + session.servoy_client_id + ' by:' + getServerID(), LOGGINGLEVEL.WARNING);
	}
}

/**
 * Schedules the session manager to cleanup abandoned batches
 * Should be called internally and only on startup 1x
 * @private  
 * @properties={typeid:24,uuid:"BDC6930B-4B85-4DCD-936B-2D1C227B0709"}
 */
function scheduleServerSessionManager() {
	plugins.scheduler.addCronJob('updateServerSession', SERVER_BATCH_INTERVAL, updateOpenServerSessions);
	application.output('Check Server Session job scheduled', LOGGINGLEVEL.INFO);
}


/**
 * @private 
 * @properties={typeid:24,uuid:"D9AB6362-F8F3-462E-83B7-C32F2CA005EF"}
 * @AllowToRunInFind
 */
function updateOpenServerSessions() {

	// Check settings for how to handle abandoned sessions when running developer
	var cleanSessionsInDeveloper = application.getUserProperty(FLAG_CLEAN_SESSIONS_IN_DEVELOPER);
	if (application.isInDeveloper() && cleanSessionsInDeveloper !== "true") {
		application.output('Abandoned sessions will not be cleaned from Servoy Developer. Change setting {user.cleanSessionsInDeveloper=true} in servoy.properties to have them cleaned', LOGGINGLEVEL.DEBUG);
		return;
	}
		
	var now = new Date();
	var serverID = getServerID();
	
	// FETCH SERVER SESSION BY SERVER ID
	var q = datasources.db.svy_security.session_servers.createSelect();
	q.result.addPk();
	q.where.add(q.columns.id.eq(serverID));

	// LOAD INTO A FOUNDSET
	var server;
	var fs = datasources.db.svy_security.session_servers.getFoundSet();
	fs.loadRecords(q);
	var count = fs.getSize();
	
	// TODO what if count > 1
	if (!count) {
		
		// REGISTER NEW SERVER SESSION
		var idx = fs.newRecord();
		if (idx < 0) {
			application.output('Failed to register server session: ' + server.id, LOGGINGLEVEL.ERROR);
		}
		server = fs.getRecord(idx);
		server.id = serverID;
		server.server_start = now;
		
	} else {
		server = fs.getRecord(1);
	}
	
	
	// UPDATE LAST SERVER PING
	server.last_server_ping = now;
	
	// TODO shall i acquire lock ?
	if (!databaseManager.saveData(server)) {
		application.output('Failed to update server timestamp: ' + server.id, LOGGINGLEVEL.ERROR);
	}
	
}

/**
 * @return {String}
 * @since 1.5.0
 * @private 
 * @properties={typeid:24,uuid:"5F24EFFA-180E-4986-A10C-68B5417E65F1"}
 */
function getServerID() {
	// TODO SVY-14929 replace it with application.getServerUUID()
	var serverId = Packages.java.lang.System.getProperty("svysecurity-serverid");
	return serverId ? serverId : null;
}

/**
 * Callback method for when solution is opened.
 * When deeplinking into solutions, the argument part of the deeplink url will be passed in as the first argument
 * All query parameters + the argument of the deeplink url will be passed in as the second argument
 * For more information on deeplinking, see the chapters on the different Clients in the Deployment Guide.
 *
 * @param {String} arg startup argument part of the deeplink url with which the Client was started
 * @param {Object<Array<String>>} queryParams all query parameters of the deeplink url with which the Client was started
 * @private 
 * @properties={typeid:24,uuid:"992E7657-A8B9-487B-9CDB-6753665D62BB"}
 */
function onSolutionOpen(arg, queryParams) {

	// CHECK IF HEADLESS
	if (application.getApplicationType() != APPLICATION_TYPES.HEADLESS_CLIENT) {
		return;
	}
	
	// TODO SVY-14929 remove system property for server UUID
	if (!getServerID()) {
		// Note: this is not thread safe
		Packages.java.lang.System.setProperty("svysecurity-serverid", application.getUUID().toString());
	}
	
	if (arg == CLIENT_ID) {
		// SCHEDULE JOB
		scheduleSessionManager();
	} else if (arg == CLUSTER_CLIENT_ID) {
		// SCHEDULE JOB
		scheduleServerSessionManager();
	}
}


/**
 * @deprecated
 * @constructor 
 * @private 
 * @properties={typeid:24,uuid:"34D86D8F-6C0A-4B3C-AD06-0DC248013415"}
 */
function ServerSession() {
		
	if (!getServerID()) {
		application.output('Failed to register server because of Server ID unknown', LOGGINGLEVEL.ERROR);
	}
	
	/**
	 * @public
	 */
	this.updatePing = function() {
		var server = getServerSessionRecord();
		server.last_server_ping = new Date();
		if (!databaseManager.saveData(server)) {
			application.output('Failed to update server timestamp: ' + server.id, LOGGINGLEVEL.ERROR);
		}
	}
	
	/**
	 * @private
	 * @return {JSRecord<db:/svy_security/session_servers>}
	 */
	function getServerSessionRecord() {
		// FETCH SERVER SESSION BY SERVER ID
		var q = datasources.db.svy_security.session_servers.createSelect();
		q.result.addPk();
		q.where.add(q.columns.id.eq(getServerID()));

		// LOAD INTO A FOUNDSET
		var fs = datasources.db.svy_security.session_servers.getFoundSet();
		fs.loadRecords(q);
		var count = fs.getSize();
		if (count == 1) {
			return fs.getRecord(1);
		} else if (count > 1) {
			// TODO what then !?
			return fs.getRecord(1);
		} else {
			return null;
		}
	}
}
