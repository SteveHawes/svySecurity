const commandLineArgs = require('command-line-args');
const fs = require('fs');
const jsdoc2md = require('jsdoc-to-markdown');
var _ = require('lodash');
 
const optionDefinitions = [
  { name: 'source', alias: 's', type: String },
  { name: 'destination', alias: 'd', type: String }
];

const options = commandLineArgs(optionDefinitions);

fs.readFile(options.source, 'utf8', readSourceCallback);

function readSourceCallback(err, fileContents) {
	if (err) throw err;	
	fileContents = cleanupFileContents(fileContents);
	writeDestination(fileContents);
}

function cleanupFileContents(fileContents) {
	//remove some Servoy-related JSDoc tags which "break" the standard jsdoc parsing
	//remove @properties
	fileContents = fileContents.replace(/@properties=\{.+\}/ig, '');
	
	//change JSRecord and JSFoundset data sources to supported JSDoc type expressions
	//here the check is specifically for the svy_security database but it could be made generic to cover any database
	fileContents = fileContents.replace(/db:\/svy_security\//ig, 'svy_security.');
	//fileContents = fileContents.replace(/db:\/.+\//ig, ''); /* this can be used for any database - will simply remove it and leave only the table name*/
	
	//remove @SuppressWarnings
	fileContents = fileContents.replace(/@SuppressWarnings \(.+\)/ig, '');
	
	//remove @AllowToRunInFind
	fileContents = fileContents.replace(/@AllowToRunInFind/ig, '');
	
	return fileContents;
}

function writeDestination(fileContents) {
	//will make a copy of the source file in the destination directory with any "bad" JSDoc tags cleaned-up
	var cleanedUpSourceFile = require('path').dirname(options.destination) + '/source-with-cleaned-up-jsdoc.js';
	fs.writeFile(cleanedUpSourceFile, fileContents, (err) => {
		if (err) throw err;
		console.log('A cleaned-up copy of the source file has been saved as "%s"', cleanedUpSourceFile);
	});	
	
	//sort the data so we get the info in alphabetical order by scope/kind/name
	var jsDocData = jsdoc2md.getTemplateDataSync({source: fileContents, 'no-cache': true});
	jsDocData = _.orderBy(jsDocData, ['scope', 'kind', 'name']);
	
	//for debug purposes if we need to take a look at the data which jsdoc generates - in pretty json format
	//fs.writeFile(cleanedUpSourceFile+'.jsdoc-data.json', JSON.stringify(jsDocData, null, 2), (err) => {
	//	if (err) throw err;		
	//});
	
	//using custom "blank" partial templates to suppress the "Kind: ...." and "Access: ..." from the result doc
	var mdOptions = {
			data: jsDocData, 
			separators: true, 
			/* 'global-index-format': 'table', */
			'no-cache': true,
			partial: [__dirname + '/templates/access.hbs', __dirname + '/templates/scope.hbs']
		};
	
	
	fileContents = jsdoc2md.renderSync(mdOptions);
	
	fs.writeFile(options.destination, fileContents, (err) => {
	  if (err) throw err;
	  console.log('The result markdown file "%s" is generated.', options.destination);
	});	
}