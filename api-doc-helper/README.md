### Helper tool for generating API documentation in markdown format from Servoy javascript source file

Servoy uses some non-standard JSDoc comments and tag formats which cause the regular JSDoc parsing and document generating tools to fail. This tool uses a pre-processing step to clean up a copy of the source file so that the JSDoc parsing can work correctly. It uses **jsdoc-to-markdown** for the actual output rendering.

**Requires that Node.js is installed.** All other dependencies will be automatically installed/updated as needed.

To generate markdown API document just execute the batch file **generate-api-doc.bat** and at the prompt specify the source .js file to use.

**Note:** Ensure that the directory where the **generate-api-doc.bat** file resides is the active/current directory before executing the batch file.

The resulting output **result-api-doc.md** file will be generated in the **output** directory along with a copy of the source file but with cleaned-up JSDoc comments which can be parsed by jsdoc-parse without errors.

The batch file can be executed from the command prompt as well specifying the source .js file as argument using:

```batch
> cd "directory-of-generate-api-doc.bat"
> generate-api-doc.bat "source-file"
```

After the result output file is generated it will be opened so you can copy its contents and update the GitHub wiki page as needed. If a default program is not set for markdown **.md** you will be prompted to select an application to open the **.md** file with.

The **generate-api-doc.bat** helps with the task automation. However the **api-doc-tool** can be used directly by executing:

```batch
> node "prepare-md.js" -s "source-file" -d "destination-file"
```
