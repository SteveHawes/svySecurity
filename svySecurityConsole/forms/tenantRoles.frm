customProperties:"formComponent:false,\
methods:{\
onShowMethodID:{\
arguments:null,\
parameters:null\
}\
}",
dataSource:"db:/svy_security/tenants",
extendsID:"7DD98CFF-0240-42E0-90E8-782BBF800121",
items:[
{
dataProviderID:"m_SelectedRoleUserMember",
displayType:11,
location:"40,339",
name:"lstMembers",
size:"340,180",
typeid:4,
uuid:"015B7567-34FE-441D-9A35-8637CC60CA25",
valuelistID:"CDC6282E-F41E-4389-9EED-2708CD1E1D11"
},
{
anchors:3,
location:"420,530",
name:"btnAddRolePermission",
onActionMethodID:"7AC50E01-69CD-4055-BA7A-6B79A8C628D7",
rolloverCursor:12,
showFocus:false,
size:"140,40",
styleClass:"flat-button transition-medium",
text:"Grant Permission",
typeid:7,
uuid:"187AC25C-7547-4F9F-AF8D-0A973D16F9CD"
},
{
anchors:3,
location:"40,527",
name:"btnAddRoleMember",
onActionMethodID:"89864AD8-AD6B-4269-B660-8F1DDA0FA822",
rolloverCursor:12,
showFocus:false,
size:"140,40",
styleClass:"flat-button transition-medium",
text:"Add Role Member",
typeid:7,
uuid:"1D0B8EB0-3A1D-4E59-9B2E-B0318A08150A"
},
{
dataProviderID:"m_SelectedRolePermission",
displayType:11,
location:"420,339",
name:"lstPermissions",
size:"340,180",
typeid:4,
uuid:"1D5C4D56-146A-4880-9369-85282D77AC5B",
valuelistID:"C301C7A1-7609-4759-A274-BEA4B9BCE04E"
},
{
labelFor:"lstMembers",
location:"40,308",
name:"lblMembers",
size:"340,26",
styleClass:"large",
text:"User members of selected role",
typeid:7,
uuid:"2EB0F929-B21C-4C36-923D-67A4E2ED503A"
},
{
anchors:3,
location:"190,527",
name:"btnRemoveRoleMember",
onActionMethodID:"BEEDF439-0669-404E-8B85-21AC380D7A17",
rolloverCursor:12,
showFocus:false,
size:"190,40",
styleClass:"flat-button transition-medium",
text:"Remove Selected Member",
typeid:7,
uuid:"4D17773F-5F58-4CC5-9376-815946B57505"
},
{
anchors:3,
location:"420,142",
name:"btnCreateRole",
onActionMethodID:"6D7007AE-C26F-4B08-A02D-118CCAB4272F",
rolloverCursor:12,
showFocus:false,
size:"190,40",
styleClass:"flat-button transition-medium",
text:"Create New Role",
typeid:7,
uuid:"55E2A991-C859-4C6F-BFCA-2E2D1809F7E6"
},
{
anchors:3,
location:"420,194",
name:"btnDeleteRole",
onActionMethodID:"F1B18E9E-4C67-40DF-AB67-45355EBE7B26",
rolloverCursor:12,
showFocus:false,
size:"190,40",
styleClass:"flat-button transition-medium",
text:"Delete Selected Role",
typeid:7,
uuid:"6763654A-8CD5-4360-BB9F-2499F9CA4C8A"
},
{
labelFor:"lstRoles",
location:"40,111",
name:"lblRoles",
size:"340,26",
styleClass:"large",
text:"Roles (select role to view its members and permissions)",
typeid:7,
uuid:"6A58C500-5EFF-4500-B591-2227B3621D0D"
},
{
anchors:3,
location:"570,530",
name:"btnRemoveRolePermissions",
onActionMethodID:"A2C40FC3-2C26-4261-B207-AC3425C41225",
rolloverCursor:12,
showFocus:false,
size:"190,40",
styleClass:"flat-button transition-medium",
text:"Remove Selected Permission",
typeid:7,
uuid:"72F46DA9-1F75-4ADB-9C9C-63670CAAFA63"
},
{
dataProviderID:"scopes.svySecurityConsole.svySecConsole_TenantRoleFilter",
displayType:11,
location:"40,142",
name:"lstRoles",
onDataChangeMethodID:"F5559F8E-503B-4C9F-A9F1-8366EAEB3399",
size:"340,138",
typeid:4,
uuid:"807B4421-A043-4F22-BEFF-608681E67738",
valuelistID:"4DE7C8DC-BA94-4BAC-9A0F-E5F9B6F84292"
},
{
location:"60,40",
name:"btnShowTenant",
onActionMethodID:"F93341EC-646C-4141-A72C-98A4D98EE72D",
rolloverCursor:12,
showClick:false,
showFocus:false,
size:"40,40",
styleClass:"font-icon large transition-medium",
text:"<span class=\"fa fa-shield\"/>",
transparent:true,
typeid:7,
uuid:"B27BFBAB-AC9D-45DE-A917-FE8A6A35DCB7"
},
{
labelFor:"lstPermissions",
location:"420,308",
name:"lblPermissions",
size:"340,26",
styleClass:"large",
text:"Permissions granted to selected role",
typeid:7,
uuid:"B83CAE10-2F21-48A4-AA9F-5BA9D0341F74"
}
],
name:"tenantRoles",
onShowMethodID:"F1A6E2C4-5F11-4AB0-A2C6-DD284AA58189",
typeid:3,
uuid:"ABA34E64-041B-4CB3-867D-1AEA6955023D"