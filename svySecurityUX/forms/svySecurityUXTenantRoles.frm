customProperties:"formComponent:false,\
useCssPosition:true",
dataSource:"db:/svy_security/roles",
encapsulation:60,
items:[
{
cssPosition:"-1,30,10,-1,150,40",
json:{
cssPosition:{
bottom:"10",
height:"40",
left:"-1",
right:"30",
top:"-1",
width:"150"
},
onActionMethodID:"2728289F-AA07-4D48-93D1-29BF6F1943C5",
styleClass:"text-tertiary clickable text-center-vertical",
text:"MANAGE ROLES"
},
name:"btnNewRole",
styleClass:"text-tertiary clickable text-center-vertical",
typeName:"bootstrapcomponents-label",
typeid:47,
uuid:"213148F7-E128-44F5-8892-5B0C6E352AA7"
},
{
cssPosition:"-1,30,10,-1,25,40",
json:{
alignment:"center",
cssPosition:{
bottom:"10",
height:"40",
left:"-1",
right:"30",
top:"-1",
width:"25"
},
faclass:"fa fa-long-arrow-right text-tertiary fa-lg clickable",
onActionMethodID:"2728289F-AA07-4D48-93D1-29BF6F1943C5",
size:{
height:25,
width:25
}
},
name:"iconNewRole",
size:"25,25",
typeName:"servoyextra-fontawesome",
typeid:47,
uuid:"6D4881F9-1FBE-4EBD-BBFA-55196A21DD34"
},
{
height:200,
partType:5,
typeid:19,
uuid:"8ED8BF19-2402-43E8-A921-D06D58AEB3A6"
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
text:"Roles"
},
name:"labelTitle",
styleClass:"padding-left-10 border-bottom text-primary border-primary h2",
typeName:"bootstrapcomponents-label",
typeid:47,
uuid:"9BE59C28-14CC-4221-B0B8-9414284B8342"
},
{
cssPosition:"50,0,60,0,0,50",
json:{
columns:[
{
dataprovider:"display_name",
filterType:"TEXT",
svyUUID:"EB63BD50-0A7A-4C34-BA93-8C51288A6892"
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
responsiveHeight:0,
rowHeight:35,
styleClass:"ag-theme-servoy no-border",
toolPanelConfig:{
suppressColumnExpandAll:true,
suppressColumnFilter:true,
suppressColumnSelectAll:true,
suppressRowGroups:true,
suppressSideButtons:true,
svyUUID:"D6BCE843-0C09-4F90-A37A-CEACBADC0893"
}
},
name:"table",
styleClass:"ag-theme-servoy no-border",
typeName:"aggrid-groupingtable",
typeid:47,
uuid:"E3606C88-9529-440D-BA90-EC0B2AC22B67"
}
],
name:"svySecurityUXTenantRoles",
navigatorID:"-1",
showInMenu:true,
size:"293,200",
typeid:3,
uuid:"0E8E188E-6C86-4C46-8BD9-C1A7CA9D4D52"