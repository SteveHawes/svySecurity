customProperties:"formComponent:false,\
methods:{\
onShowMethodID:{\
arguments:null,\
parameters:null\
}\
},\
useCssPosition:true",
dataSource:"db:/svy_security/users",
extendsID:"7DD98CFF-0240-42E0-90E8-782BBF800121",
items:[
{
cssPosition:"153,-1,-1,60,340,138",
dataProviderID:"m_SelectedRole",
displayType:11,
location:"60,153",
name:"lstRoles",
size:"340,138",
typeid:4,
uuid:"0EB23AC3-28AC-4A16-88C0-5BFE4DC81775",
valuelistID:"E92BD312-A11F-49B1-9FAD-EF44C60E41B9"
},
{
cssPosition:"40,-1,-1,60,40,40",
location:"60,40",
name:"btnShowUser",
onActionMethodID:"5A0D7DC5-53EC-430D-AD5D-8FA80E29305F",
rolloverCursor:12,
showClick:false,
showFocus:false,
size:"40,40",
styleClass:"font-icon large transition-medium",
text:"<span class=\"fa fa-user\"/>",
toolTipText:"Show User",
transparent:true,
typeid:7,
uuid:"2E0B0FD1-67BC-45BB-8641-8E54936B9D54"
},
{
cssPosition:"335,-1,-1,60,340,26",
labelFor:"lstPermissions",
location:"60,335",
name:"lblPermissions",
size:"340,26",
styleClass:"large",
text:"Effective user permissions based on roles membership",
typeid:7,
uuid:"3999027E-8C2B-4B09-B500-C858BA74C6EE"
},
{
cssPosition:"366,-1,-1,60,340,180",
dataProviderID:"m_SelectedPermission",
displayType:11,
location:"60,366",
name:"lstPermissions",
size:"340,180",
typeid:4,
uuid:"59171592-912A-45A8-A00A-E62E482A1AE7",
valuelistID:"C1EB2156-0C56-4AC9-85E1-BEE1FD0C5C85"
},
{
anchors:3,
cssPosition:"205,135,-1,-1,240,40",
location:"425,205",
name:"btnRemoveRole",
onActionMethodID:"374BFE86-5EF8-4877-95FD-1C09435C5770",
rolloverCursor:12,
showFocus:false,
size:"240,40",
styleClass:"flat-button transition-medium",
text:"Remove User From Selected Role",
typeid:7,
uuid:"68496CF6-9D37-4E50-9687-56CD8AA1E859"
},
{
cssPosition:"122,-1,-1,60,340,26",
labelFor:"lstRoles",
location:"60,122",
name:"lblRoles",
size:"340,26",
styleClass:"large",
text:"User is member of the following roles",
typeid:7,
uuid:"7A7F0325-9289-46DD-9765-DDC6261CB8FB"
},
{
anchors:3,
cssPosition:"153,133,-1,-1,242,40",
location:"425,153",
name:"btnAddRole",
onActionMethodID:"EB5DF68D-5B39-4908-9BB3-0B8DC15217F3",
rolloverCursor:12,
showFocus:false,
size:"242,40",
styleClass:"flat-button transition-medium",
text:"Add User To Role",
toolTipText:"Add the user as member of a role",
typeid:7,
uuid:"913C81C9-EEEA-419F-A6BF-8C4EB59D84BB"
}
],
name:"userRoles",
onShowMethodID:"A2D00974-63B2-410D-B89F-5976876879E7",
typeid:3,
uuid:"F2EEF3FF-3B9F-483A-9019-FEEC88BB8C72"