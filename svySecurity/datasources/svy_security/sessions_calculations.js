/**
 * @return {Boolean}
 * @properties={type:-4,typeid:36,uuid:"F4A3FEC5-3337-4ADD-AD0A-B92C5863A2F1"}
 */
function is_active()
{
	// SESSION IS CLOSED
	if(session_end) return false;
	
	// SESSION IS NOT CLOSED, CHECK ACTIVE CLIENTS IN CLUSTER
	var cleanSessionsInCluster = application.getUserProperty("cleanSessionsInCluster");
	if (cleanSessionsInCluster === "true") {	// IF IS NOT ON THIS SERVER
		// TODO SVY-14929 replace it with application.getServerUUID()
		if (servoy_server_id != Packages.java.lang.System.getProperty("svysecurity-serverid")) {
			// check session end
			return true;
		} 
	}
	
	var clients = plugins.clientmanager.getConnectedClients();
	for(var i in clients){
		if(servoy_client_id == clients[i].getClientID()) return true;
	}
	return false;
}
