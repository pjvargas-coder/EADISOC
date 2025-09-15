@echo off
setlocal EnableDelayedExpansion

:: EADISOC - Script de inicio para Windows
echo EADISOC - Sistema de Gestion de Pacientes
echo ==========================================

:: Verificar que estamos en el directorio correcto
if not exist "backend" (
    echo ERROR: Directorio backend no encontrado
    echo Este script debe ejecutarse desde el directorio raiz del proyecto EADISOC
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ERROR: Directorio frontend no encontrado
    echo Este script debe ejecutarse desde el directorio raiz del proyecto EADISOC
    pause
    exit /b 1
)

:: Verificar MongoDB
echo Verificando MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo MongoDB no esta ejecutandose. Intentando iniciar...
    net start MongoDB >nul 2>&1
    if errorlevel 1 (
        echo ERROR: No se pudo iniciar MongoDB
        echo Inicia MongoDB manualmente e intenta de nuevo
        pause
        exit /b 1
    )
    timeout /t 3 >nul
)
echo MongoDB verificado

:: Configurar Backend
echo Configurando backend...
cd backend

:: Crear entorno virtual si no existe
if not exist "venv" (
    echo Creando entorno virtual de Python...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: No se pudo crear el entorno virtual
        pause
        exit /b 1
    )
)

:: Activar entorno virtual e instalar dependencias
call venv\Scripts\activate.bat
echo Instalando dependencias de Python...
pip install -r requirements.txt >nul 2>&1
if errorlevel 1 (
    echo ERROR: No se pudieron instalar las dependencias de Python
    pause
    exit /b 1
)

cd ..
echo Backend configurado

:: Configurar Frontend
echo Configurando frontend...
cd frontend

:: Instalar dependencias si no existen
if not exist "node_modules" (
    echo Instalando dependencias de Node.js...
    where yarn >nul 2>&1
    if !errorlevel! equ 0 (
        yarn install >nul 2>&1
    ) else (
        npm install >nul 2>&1
    )
    if errorlevel 1 (
        echo ERROR: No se pudieron instalar las dependencias de Node.js
        pause
        exit /b 1
    )
)

cd ..
echo Frontend configurado

:: Iniciar Backend
echo Iniciando backend en puerto 8000...
cd backend
call venv\Scripts\activate.bat
start "EADISOC Backend" /MIN cmd /c "uvicorn server:app --reload --host 0.0.0.0 --port 8000"
cd ..

:: Esperar a que el backend esté listo
echo Esperando a que el backend este listo...
for /l %%i in (1,1,30) do (
    timeout /t 1 >nul
    curl -s http://localhost:8000/api/ >nul 2>&1
    if not errorlevel 1 (
        echo Backend iniciado correctamente
        goto :backend_ready
    )
)
echo ERROR: El backend no pudo iniciarse
pause
exit /b 1

:backend_ready

:: Poblar base de datos
echo Poblando base de datos con datos de prueba...
timeout /t 3 >nul
curl -s -X POST http://localhost:8000/api/seed-data >nul 2>&1

:: Iniciar Frontend
echo Iniciando frontend en puerto 3000...
cd frontend
where yarn >nul 2>&1
if %errorlevel% equ 0 (
    start "EADISOC Frontend" cmd /c "yarn start"
) else (
    start "EADISOC Frontend" cmd /c "npm start"
)
cd ..

echo.
echo EADISOC iniciado correctamente!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Credenciales de prueba:
echo admin / admin123
echo doctor1 / doctor123
echo usuario1 / usuario123
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause >nul

:: Abrir navegador
start http://localhost:3000

echo Presiona cualquier tecla para cerrar...
pause >nul