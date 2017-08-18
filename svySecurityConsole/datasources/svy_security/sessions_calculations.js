/**
 * @properties={type:12,typeid:36,uuid:"FA909548-54ED-4EEA-BAB1-7ABC45DFAEAE"}
 */
function duration_text()
{
    //return duration in format like "5h 15m 43s"    
	return scopes.svySecurityConsoleHelper.convertDurationToStr(session_duration || 0);
}
