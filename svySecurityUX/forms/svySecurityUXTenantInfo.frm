customProperties:"formComponent:false,\
useCssPosition:true",
dataSource:"db:/svy_security/tenants",
encapsulation:60,
items:[
{
cssPosition:"-1,calc(16% - 40px),15,-1,80,15",
json:{
cssPosition:{
bottom:"15",
height:"15",
left:"-1",
right:"calc(16% - 40px)",
top:"-1",
width:"80"
},
styleClass:"h5 text-tertiary text-center",
text:"SESSIONS"
},
name:"label_9cc",
styleClass:"h5 text-tertiary text-center",
typeName:"bootstrapcomponents-label",
typeid:47,
uuid:"047778E8-7E8A-40D1-838D-59F2F0F59EF8"
},
{
cssPosition:"-1,calc(16% - 25px),34,-1,50,50",
json:{
cssPosition:{
bottom:"34",
height:"50",
left:"-1",
right:"calc(16% - 25px)",
top:"-1",
width:"50"
},
styleClass:"btn h4 font-weight-bold btn-default btn-round",
text:"%%activeSessions%%"
},
name:"button_4",
styleClass:"btn h4 font-weight-bold btn-default btn-round",
typeName:"bootstrapcomponents-button",
typeid:47,
uuid:"0E8DFAED-C4CF-4A2D-B3E6-57A47B2901FD"
},
{
cssPosition:"150,15,160,15,0,0",
json:{
cssPosition:{
bottom:"160",
height:"0",
left:"15",
right:"15",
top:"150",
width:"0"
},
type:"bar"
},
name:"chart",
typeName:"svychartjs-chart",
typeid:47,
uuid:"1532B81C-D42B-4D7C-9D74-5C26B4F0B680"
},
{
cssPosition:"57,0,-1,0,0,1",
json:{
cssPosition:{
bottom:"-1",
height:"1",
left:"0",
right:"0",
top:"57",
width:"0"
},
styleClass:"border-top"
},
styleClass:"border-top",
typeName:"bootstrapcomponents-label",
typeid:47,
uuid:"1A82F557-4B5E-4FE2-8FD7-FE52C6EE8E2A"
},
{
cssPosition:"-1,-1,15,calc(16% - 40px),80,15",
json:{
cssPosition:{
bottom:"15",
height:"15",
left:"calc(16% - 40px)",
right:"-1",
top:"-1",
width:"80"
},
styleClass:"h5 text-tertiary text-center",
text:"LOCKED"
},
name:"label_9",
styleClass:"h5 text-tertiary text-center",
typeName:"bootstrapcomponents-label",
typeid:47,
uuid:"2CA4EAFA-33C2-4724-BF42-035DBB4EFFB4"
},
{
cssPosition:"-1,-1,30,calc(16% - 25px),50,50",
json:{
cssPosition:{
bottom:"30",
height:"50",
left:"calc(16% - 25px)",
right:"-1",
top:"-1",
width:"50"
},
faclass:"fa fa-lock h1 text-danger",
onActionMethodID:"AB106273-1B8B-4BF5-A343-7E148F1F7A38"
},
name:"faLocked",
typeName:"servoyextra-fontawesome",
typeid:47,
uuid:"3874D9F8-BDDA-4D99-AD92-A20B23A29845"
},
{
cssPosition:"10,10,-1,10,0,50",
json:{
cssPosition:{
bottom:"-1",
height:"50",
left:"10",
right:"10",
top:"10",
width:"0"
},
styleClass:"h1 font-weight-bold text-primary",
text:"%%display_name%%"
},
name:"labelDisplayName",
styleClass:"h1 font-weight-bold text-primary",
typeName:"bootstrapcomponents-label",
typeid:47,
uuid:"42C3F55D-D06D-4EE4-A762-9C7D09575D82"
},
{
cssPosition:"-1,-1,30,calc(49% - 25px),50,50",
json:{
cssPosition:{
bottom:"30",
height:"50",
left:"calc(49% - 25px)",
right:"-1",
top:"-1",
width:"50"
},
faclass:"fa fa-share-alt h1 text-primary",
onActionMethodID:null,
size:{
height:25,
width:25
}
},
name:"faMaster",
size:"25,25",
typeName:"servoyextra-fontawesome",
typeid:47,
uuid:"44594634-30FD-449A-91C4-C1C72B36E051"
},
{
cssPosition:"79,10,-1,22,0,40",
json:{
cssPosition:{
bottom:"-1",
height:"40",
left:"22",
right:"10",
top:"79",
width:"0"
},
styleClass:"h4",
text:"%%tenant_name%%"
},
name:"labelName",
styleClass:"h4",
typeName:"bootstrapcomponents-label",
typeid:47,
uuid:"54AAEEC9-4471-4F6F-B77A-15A35F8C8DC3"
},
{
height:480,
partType:5,
typeid:19,
uuid:"59F26E86-8838-4D9A-BB6B-35AFA86B32EA"
},
{
cssPosition:"-1,0,105,0,0,1",
json:{
cssPosition:{
bottom:"105",
height:"1",
left:"0",
right:"0",
top:"-1",
width:"0"
},
styleClass:"border-top"
},
name:"label_5",
styleClass:"border-top",
typeName:"bootstrapcomponents-label",
typeid:47,
uuid:"69CBB314-1854-453A-A5D4-50D58B7DD7C7"
},
{
cssPosition:"-1,-1,15,calc(49% - 40px),80,15",
json:{
cssPosition:{
bottom:"15",
height:"15",
left:"calc(49% - 40px)",
right:"-1",
top:"-1",
width:"80"
},
styleClass:"h5 text-tertiary text-center",
text:"MASTER"
},
name:"labelMaster",
styleClass:"h5 text-tertiary text-center",
typeName:"bootstrapcomponents-label",
typeid:47,
uuid:"A2633EB5-C332-4422-8F87-F9A927798101"
},
{
cssPosition:"-1,-1,30,calc(16% - 25px),50,50",
json:{
cssPosition:{
bottom:"30",
height:"50",
left:"calc(16% - 25px)",
right:"-1",
top:"-1",
width:"50"
},
faclass:"fa fa-lock-open h1 text-success",
onActionMethodID:"4286147E-324E-48B2-80A9-1F5344A0A1CF",
size:{
height:25,
width:25
}
},
name:"faUnlocked",
size:"25,25",
typeName:"servoyextra-fontawesome",
typeid:47,
uuid:"FC1C03E5-8369-49B7-A15F-8CC7683D1690"
}
],
name:"svySecurityUXTenantInfo",
navigatorID:"-1",
onRecordSelectionMethodID:"B121EB61-8408-4012-BFF3-ADAA71C4B737",
onShowMethodID:"BFFEFFCE-6ABE-4572-B308-BA93FD0851B9",
showInMenu:true,
typeid:3,
uuid:"BD6886CD-7075-4C46-82E7-54904D0C65F6"