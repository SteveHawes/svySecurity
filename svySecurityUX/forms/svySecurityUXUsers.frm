customProperties:"formComponent:false,\
useCssPosition:true",
dataSource:"db:/svy_security/users",
encapsulation:60,
items:[
{
cssPosition:"-1,-1,10,28,115,40",
json:{
cssPosition:{
bottom:"10",
height:"40",
left:"28",
right:"-1",
top:"-1",
width:"115"
},
onActionMethodID:"6C10F510-A289-4DDA-9D24-4666F08E6F9D",
styleClass:"text-success clickable text-center-vertical",
text:"NEW USER"
},
name:"btnNewUser",
styleClass:"text-success clickable text-center-vertical",
typeName:"bootstrapcomponents-label",
typeid:47,
uuid:"10BD6E6A-E680-4C25-BE98-53268A174F56"
},
{
cssPosition:"-1,-1,10,278,25,40",
json:{
alignment:"center",
cssPosition:{
bottom:"10",
height:"40",
left:"278",
right:"-1",
top:"-1",
width:"25"
},
faclass:"fa fa-user-minus text-danger fa-lg clickable",
onActionMethodID:"5671D9E4-2485-4788-AAD6-F5744DC20D11",
size:{
height:25,
width:25
}
},
name:"iconDeleteUser",
size:"25,25",
typeName:"servoyextra-fontawesome",
typeid:47,
uuid:"49B8D349-39D8-4E2C-B9A2-E2541CADC1E5"
},
{
cssPosition:"-1,-1,10,170,134,40",
json:{
cssPosition:{
bottom:"10",
height:"40",
left:"170",
right:"-1",
top:"-1",
width:"134"
},
onActionMethodID:"5671D9E4-2485-4788-AAD6-F5744DC20D11",
styleClass:"text-danger clickable text-center-vertical",
text:"REMOVE USER"
},
name:"btnDeleteUser",
styleClass:"text-danger clickable text-center-vertical",
typeName:"bootstrapcomponents-label",
typeid:47,
uuid:"564FFE2C-0994-4903-AF22-2348C4AF50E7"
},
{
cssPosition:"-1,calc(50% + 15px),15,15,0,35",
json:{
cssPosition:{
bottom:"15",
height:"35",
left:"15",
right:"calc(50% + 15px)",
top:"-1",
width:"0"
},
dataProviderID:"newUserName",
onActionMethodID:"3D9471FF-E0AA-488A-982B-03ADF885DF44",
onDataChangeMethodID:"72F57EC5-B60D-4491-B4A1-86ABFAAE0639",
placeholderText:"User Name...",
visible:false
},
name:"fldNewUser",
typeName:"bootstrapcomponents-textbox",
typeid:47,
uuid:"87238CC7-FED2-4429-9E28-0DA7623F71AE",
visible:false
},
{
cssPosition:"10,0,-1,0,0,50",
json:{
cssPosition:{
bottom:"-1",
height:"50",
left:"0",
right:"0",
top:"10",
width:"0"
},
styleClass:"padding-left-10 border-bottom text-primary border-primary h2",
text:"Users"
},
name:"labelTitle",
styleClass:"padding-left-10 border-bottom text-primary border-primary h2",
typeName:"bootstrapcomponents-label",
typeid:47,
uuid:"8E955C7E-40A2-4D4A-95AB-DB6BA0B2E574"
},
{
cssPosition:"-1,70,15,calc(50% + 15px),0,35",
json:{
cssPosition:{
bottom:"15",
height:"35",
left:"calc(50% + 15px)",
right:"70",
top:"-1",
width:"0"
},
dataProviderID:"newUserEmail",
onActionMethodID:"3D9471FF-E0AA-488A-982B-03ADF885DF44",
onDataChangeMethodID:"72F57EC5-B60D-4491-B4A1-86ABFAAE0639",
placeholderText:"Email...",
visible:false
},
name:"fldNewEmail",
typeName:"bootstrapcomponents-textbox",
typeid:47,
uuid:"9710FD37-D689-4A49-A4B6-621D0BAB4A68",
visible:false
},
{
cssPosition:"50,0,60,0,0,50",
json:{
columns:[
{
dataprovider:"user_name",
filterType:"TEXT",
svyUUID:"1EF61B9F-673D-4917-A0F1-793B8257FC97"
},
{
dataprovider:"email",
filterType:"TEXT",
svyUUID:"C1F40363-3074-439A-A7C9-10404A519C61"
},
{
autoResize:false,
enableResize:false,
enableRowGroup:false,
enableSort:false,
enableToolPanel:false,
id:"edit",
maxWidth:50,
minWidth:50,
styleClass:"fa fa-pencil clickable",
svyUUID:"0A08D564-E8A0-41C7-81C5-1AB7953B67F7",
width:50
}
],
cssPosition:{
bottom:"60",
height:"50",
left:"0",
right:"0",
top:"50",
width:"0"
},
gridOptions:{
floatingFilter:"true",
floatingFiltersHeight:"40",
headerHeight:"10"
},
onCellClick:"3167013F-F9E9-4CDE-9042-0F18AA90FF31",
responsiveHeight:0,
rowHeight:35,
styleClass:"ag-theme-servoy no-border",
toolPanelConfig:{
suppressColumnExpandAll:true,
suppressColumnFilter:true,
suppressColumnSelectAll:true,
suppressRowGroups:true,
suppressSideButtons:true,
svyUUID:"61F36A6C-41E8-4851-B74B-D782EACCC796"
}
},
name:"table",
styleClass:"ag-theme-servoy no-border",
typeName:"aggrid-groupingtable",
typeid:47,
uuid:"9A9387F2-9920-494D-9509-ADDD64DD3FD7"
},
{
cssPosition:"-1,40,10,-1,25,40",
json:{
alignment:"center",
cssPosition:{
bottom:"10",
height:"40",
left:"-1",
right:"40",
top:"-1",
width:"25"
},
faclass:"fa fa-check text-success fa-lg clickable",
onActionMethodID:"3D9471FF-E0AA-488A-982B-03ADF885DF44",
size:{
height:25,
width:25
},
visible:false
},
name:"iconConfirmNew",
size:"25,25",
typeName:"servoyextra-fontawesome",
typeid:47,
uuid:"B81AB28F-6FED-4DF4-82F0-1F5E5D101755",
visible:false
},
{
cssPosition:"-1,15,10,-1,25,40",
json:{
alignment:"center",
cssPosition:{
bottom:"10",
height:"40",
left:"-1",
right:"15",
top:"-1",
width:"25"
},
faclass:"fa fa-remove text-tertiary fa-lg clickable",
onActionMethodID:"9E543316-8C5D-470B-B340-1C748A1B622B",
size:{
height:25,
width:25
},
visible:false
},
name:"iconCancelNew",
size:"25,25",
typeName:"servoyextra-fontawesome",
typeid:47,
uuid:"CD74EB6B-80D6-465D-A59B-28446A6C7904",
visible:false
},
{
height:200,
partType:5,
typeid:19,
uuid:"DEBF1A30-9FC0-4531-A503-7B28C5E43427"
},
{
cssPosition:"-1,-1,10,110,25,40",
json:{
alignment:"center",
cssPosition:{
bottom:"10",
height:"40",
left:"110",
right:"-1",
top:"-1",
width:"25"
},
faclass:"fa fa-user-plus text-success fa-lg clickable",
onActionMethodID:"6C10F510-A289-4DDA-9D24-4666F08E6F9D",
size:{
height:25,
width:25
}
},
name:"iconNewUser",
size:"25,25",
typeName:"servoyextra-fontawesome",
typeid:47,
uuid:"F592145F-C45F-46C6-A362-9151AEA30DBE"
}
],
name:"svySecurityUXUsers",
navigatorID:"-1",
onRecordSelectionMethodID:"3A355438-1518-41B9-9DD7-C4816547FF2A",
onShowMethodID:"20AF5EC1-DC87-45E4-96DD-00E2491C83EB",
showInMenu:true,
size:"408,200",
typeid:3,
uuid:"59C44C2D-CAD4-414F-9B26-E2F43BD8B846"