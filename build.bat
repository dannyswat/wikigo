cd %~dp0
rmdir /s /q build
mkdir build
mkdir build\data
copy release\* build
cd server
go build -o ..\build\wikigo.exe
cd ..\client
npm run build
