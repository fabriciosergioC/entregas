# 📱 Como Testar no Celular

## ✅ Pré-requisitos

1. **PC e celular devem estar na MESMA rede WiFi**
2. **Backend e Frontend devem estar rodando**

## 🚀 Iniciando os Servidores

### Opção 1: Usando o script automático (Recomendado)
```bash
start-dev.bat
```
Este script inicia:
- Backend na porta 3001
- Frontend na porta 3000 (acessível na rede)

### Opção 2: Manual
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend (acessível na rede)
npm run dev -- -H 0.0.0.0
```

## 📲 Acessando do Celular

No navegador do celular, acesse:

```
http://192.168.1.3:3000/login
```

### URLs disponíveis:
- **Login**: http://192.168.1.3:3000/login
- **Pedidos**: http://192.168.1.3:3000/pedidos
- **Mapa**: http://192.168.1.3:3000/mapa
- **Estabelecimento**: http://192.168.1.3:3000/estabelecimento

## 🔍 Se não conectar:

### 1. Verifique se os servidores estão rodando
No PC, você deve ver:
```
🚀 Servidor backend rodando em http://0.0.0.0:3001
✓ Ready in 0.0s (Frontend)
```

### 2. Verifique o IP da sua máquina
```bash
ipconfig | findstr /i "IPv4"
```
Se o IP for diferente de `192.168.1.3`, atualize o arquivo `.env.local`:
```
NEXT_PUBLIC_API_URL=http://SEU_IP:3001
NEXT_PUBLIC_SOCKET_URL=http://SEU_IP:3001
```

### 3. Verifique o Firewall do Windows
O firewall pode estar bloqueando. Para liberar:

1. Abra o **Painel de Controle** > **Firewall do Windows**
2. Clique em **Permitir um aplicativo**
3. Encontre **Node.js** e marque as caixas **Privada** e **Pública**

Ou temporariamente desative o firewall para teste.

### 4. Teste a conexão do backend
No navegador do celular, acesse:
```
http://192.168.1.3:3001/health
```
Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "...",
  "pedidos": 2,
  "entregadores": 0,
  "socketsConectados": 0
}
```

## ⚠️ Problemas Comuns

### "Erro de conexão com o servidor"
- Backend não está rodando
- IP incorreto no `.env.local`
- Firewall bloqueando

### "Servidor Offline" no login
- Verifique se o backend está rodando
- Confira se o IP `192.168.1.3` está correto
- Teste `http://192.168.1.3:3001/health` no navegador do celular

### Página não carrega no celular
- Frontend não foi iniciado com `-H 0.0.0.0`
- PC e celular em redes WiFi diferentes
- Firewall bloqueando porta 3000

## 🛠️ Comandos Úteis

### Reiniciar tudo
Feche as janelas do terminal e execute:
```bash
start-dev.bat
```

### Ver logs do backend
O terminal do backend mostra:
- ✅ Pedidos criados
- 📡 Eventos WebSocket
- 📍 Localizações recebidas

### Ver logs do frontend
No navegador do celular, use **Chrome DevTools Remote**:
1. No PC, acesse: `chrome://inspect/#devices`
2. Conecte o celular via USB
3. Inspecione a página para ver console e network

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique se PC e celular estão na mesma rede
2. Confira se o IP está correto
3. Teste o endpoint `/health` do backend
4. Verifique o firewall
