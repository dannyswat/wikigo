cd %~dp0
rmdir /s /q build
mkdir build
mkdir build\data
copy release\* build
mkdir build\views
copy server\views\* build\views
cd server
go build -o ..\build\wikigo.exe
cd ..\client
npm run build
