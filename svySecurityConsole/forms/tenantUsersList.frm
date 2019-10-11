customProperties:"formComponent:false,\
useCssPosition:true",
dataSource:"db:/svy_security/users",
extendsID:"EAE3DC77-8EEA-41E2-8564-F52829D98C82",
items:[
{
cssPosition:"160,10,-109,10,780,429",
customProperties:"",
extendsID:"904AF726-ED01-443E-A94B-4F28A5F4D28D",
json:{
anchors:0,
columns:[
{
dataprovider:"user_name",
headerText:"User",
svyUUID:"3E316DEF-C147-499D-ABD1-77A0E1F12FCF"
},
{
dataprovider:"display_name",
headerText:"Display Name",
svyUUID:"D4DE2881-B48A-4B72-8BA9-012245F686B3"
},
{
dataprovider:"creation_datetime",
format:"yyyy-MM-dd HH:mm",
headerText:"Last Login",
svyUUID:"96918ADE-E84F-4AA9-81F9-2816311925E9"
}
],
cssPosition:{
bottom:"-109",
height:"429",
left:"10",
right:"10",
top:"160",
width:"780"
},
foundset:{
foundsetSelector:""
}
},
typeid:47,
uuid:"19467DFA-B1E2-4AB7-A9DF-943E99C12555"
},
{
cssPosition:"40,-1,-1,60,40,40",
location:"60,40",
name:"btnShowTenant",
onActionMethodID:"860B7B62-70AC-487B-80C3-B2EE3864ABDD",
rolloverCursor:12,
showClick:false,
showFocus:false,
size:"40,40",
styleClass:"font-icon large transition-medium",
text:"<span class=\"fa fa-shield\"/>",
toolTipText:"Show tenant",
transparent:true,
typeid:7,
uuid:"509B7884-EB0C-4B95-A25C-0DA5F993D8C8"
},
{
anchors:3,
cssPosition:"90,669,-1,-1,130,40",
location:"1,90",
name:"btnCreateUser",
onActionMethodID:"A53EB1AC-ADE7-4691-9F2A-8A55C8A14EEB",
rolloverCursor:12,
showFocus:false,
size:"130,40",
styleClass:"flat-button transition-medium",
text:"Create New User",
typeid:7,
uuid:"B8B722AE-4FF5-4659-8F41-3673549CE298"
}
],
name:"tenantUsersList",
titleText:"Tenant Users",
typeid:3,
uuid:"DADD00F9-4804-4111-B29D-A03A8491B7E7"