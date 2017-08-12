@echo off
rem This is a batch file for generating GitHub API documentation from Servoy javascript source files

rem The source javascript file can be provided as argument to this batch file (if not provided the user will be prompted for it)

rem Clear the variable.
set varSourceFile=

rem create the output directory
md output

rem Change the result output file as needed - as is it will be generated in the output folder 
set varResultFile="output\result-api-doc.md"

if "%~1"=="" goto PROMPT_FOR_PATH

set varSourceFile=%~1
 
goto CHECK_INPUT

:PROMPT_FOR_PATH
set /P varSourceFile=Please specify the javascript (.js) source file:

:CHECK_INPUT
if "%varSourceFile%"=="" goto ERROR_INFO

rem Remove any quotes (") from the user input.
set varSourceFile=%varSourceFile:"=%
rem Surround with quotes to support spaces in paths.
set varSourceFile="%varSourceFile%"

rem install/update all dependencies
cd api-doc-tool
call npm install
cd ..

rem Generate the md file - change the path to the "prepare-md.js" as needed
call node "api-doc-tool\prepare-md.js" -s %varSourceFile% -d %varResultFile% 

rem Open the generated markdown file (should open it with the default app associated with .md files or prompt for application)
start "" %varResultFile%

goto END

:ERROR_INFO
echo Javascript source file is not specified! Exiting program!
set errorlevel=1

:END