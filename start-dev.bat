@echo off
title App Entregador - Desenvolvimento

echo.
echo ============================================
echo    App Entregador - Modo Desenvolvimento
echo ============================================
echo.

echo Iniciando Backend (porta 3001)...
echo.

:: Inicia backend
start "Backend - Dev" cmd /k "npm run dev:backend"

:: Aguarda backend iniciar
timeout /t 2 /nobreak >nul

echo.
echo Iniciando Frontend Dev (porta 3000)...
echo.

:: Inicia frontend em modo desenvolvimento (acessível na rede)
start "Frontend Dev - Porta 3000" cmd /k "npm run dev -- -H 0.0.0.0"

:: Aguarda frontend iniciar
timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo    Servidores de Desenvolvimento Iniciados!
echo ============================================
echo.
echo Acesse no PC:
echo    Estabelecimento: http://localhost:3000/estabelecimento
echo    Login Entregador: http://localhost:3000/login
echo    Pedidos: http://localhost:3000/pedidos
echo    Mapa/Navegacao: http://localhost:3000/mapa
echo.
echo Acesse no CELULAR (mesma rede WiFi):
echo    http://192.168.1.3:3000/login
echo.
echo Backend API: http://192.168.1.3:3001
echo.
echo ============================================
echo.
echo Para parar os servidores:
echo    1. Feche as janelas do terminal
echo    2. Ou pressione Ctrl+C em cada uma
echo.
echo Modo: Desenvolvimento (com hot-reload)
echo.
pause
