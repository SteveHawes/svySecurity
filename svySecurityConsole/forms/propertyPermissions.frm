customProperties:"formComponent:false,\
methods:{\
onShowMethodID:{\
arguments:null,\
parameters:null\
}\
},\
useCssPosition:true",
dataSource:"db:/svy_security/svy_properties",
deprecated:"unused",
extendsID:"7DD98CFF-0240-42E0-90E8-782BBF800121",
items:[
{
cssPosition:"40,-1,-1,60,40,40",
location:"60,40",
name:"btnShowUser",
onActionMethodID:"CA0E4A39-1842-44E3-952B-2DBACCCAE31F",
rolloverCursor:12,
showClick:false,
showFocus:false,
size:"40,40",
styleClass:"font-icon large transition-medium",
text:"<span class=\"fa fa-key\"/>",
toolTipText:"Show Property",
transparent:true,
typeid:7,
uuid:"0DF21BAA-53E5-4497-A128-5122F8CC54DC"
},
{
cssPosition:"153,-1,-1,60,340,138",
dataProviderID:"m_SelectedProperty",
displayType:11,
location:"60,153",
name:"lstRoles",
size:"340,138",
typeid:4,
uuid:"28950C10-5F54-4585-BCE2-7DE171399E94",
valuelistID:"732D8AED-14A8-4C80-B714-53F872749CE5"
},
{
anchors:3,
cssPosition:"205,95,-1,-1,280,40",
location:"425,205",
name:"btnRemoveRole",
onActionMethodID:"E74DB18E-58F7-4845-BDF0-16C7C7EE0CE2",
rolloverCursor:12,
showFocus:false,
size:"280,40",
styleClass:"flat-button transition-medium",
text:"Remove Property From Selected Permission",
typeid:7,
uuid:"4F9EE12A-BA89-402E-87F8-2BD8AB4D7124"
},
{
cssPosition:"122,-1,-1,60,340,26",
labelFor:"lstRoles",
location:"60,122",
name:"lblRoles",
size:"340,26",
styleClass:"large",
text:"Property is granted by the following permissions",
typeid:7,
uuid:"9726C56B-225C-48E0-B6E4-7BD9D4286BEA"
},
{
anchors:3,
cssPosition:"153,93,-1,-1,282,40",
location:"425,153",
name:"btnAddRole",
onActionMethodID:"97A4DF03-5C38-497A-B788-3E0BF32AF5F1",
rolloverCursor:12,
showFocus:false,
size:"282,40",
styleClass:"flat-button transition-medium",
text:"Add Property to Permission",
toolTipText:"Add the user as member of a role",
typeid:7,
uuid:"B904C109-E4A4-4DC5-97AB-5BE351F24342"
}
],
name:"propertyPermissions",
onShowMethodID:"67BDA99B-F7A3-417B-B6FE-3764BDE97CA2",
typeid:3,
uuid:"4D43C980-7BA3-4A6E-B139-AEABE324C2B5"