@echo off
title App Entregador - Producao

echo.
echo ============================================
echo    App Entregador - Servidor Producao
echo ============================================
echo.

:: Verifica se o build foi feito
if not exist ".next" (
    echo Build nao encontrado! Executando build agora...
    call npm run build
    if errorlevel 1 (
        echo.
        echo Erro no build!
        pause
        exit /b 1
    )
)

echo Build encontrado!
echo.
echo Iniciando Backend (porta 3001)...
echo.

:: Inicia backend em segundo plano
start "Backend - Porta 3001" cmd /k "npm run dev:backend"

:: Aguarda backend iniciar
timeout /t 3 /nobreak >nul

echo.
echo Iniciando Frontend Producao (porta 3000)...
echo.

:: Inicia frontend em producao
start "Frontend Producao - Porta 3000" cmd /k "npm run start"

:: Aguarda frontend iniciar
timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo    Servidores Iniciados com Sucesso!
echo ============================================
echo.
echo Acesse:
echo.
echo    Estabelecimento: http://localhost:3000/estabelecimento
echo    Login Entregador: http://localhost:3000/login
echo    Pedidos: http://localhost:3000/pedidos
echo    Mapa/Navegacao: http://localhost:3000/mapa
echo.
echo Backend API: http://localhost:3001
echo.
echo ============================================
echo.
echo Para parar os servidores:
echo    1. Feche as janelas do terminal
echo    2. Ou pressione Ctrl+C em cada uma
echo.
pause
