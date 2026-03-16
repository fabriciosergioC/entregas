# 🚀 Deploy no Render - Backend com WebSocket

Este guia explica como fazer deploy **apenas do backend** (servidor Express + Socket.IO) na hospedagem do Render.

## 📋 Pré-requisitos

1. Conta no [Render](https://render.com) (gratuita)
2. Repositório no GitHub/GitLab com o código
3. Frontend hospedado separadamente (Vercel, Netlify, etc.)

---

## ⚙️ Configuração do Projeto

### 1. Estrutura de Arquivos

```
entregas-master/
├── server/
│   └── index.ts          # Servidor backend
├── tsconfig.server.json  # TypeScript config para o servidor
├── render.yaml           # Configuração do Render
├── package.json          # Scripts de build e start
├── .gitignore            # Ignora node_modules e dist
└── dist/                 # Gerado pelo build (não commitar)
    └── index.js          # JavaScript compilado
```

### 2. Scripts do package.json

```json
{
  "scripts": {
    "build:server": "tsc --project tsconfig.server.json",
    "start:prod": "node dist/index.js"
  }
}
```

- `build:server`: Compila o TypeScript para JavaScript na pasta `dist/`
- `start:prod`: Inicia o servidor em produção usando `node dist/index.js`

---

## 🎯 Passo a Passo do Deploy

### 1. Preparar o Repositório

```bash
# Commitar as alterações
git add .
git commit -m "Configurar deploy backend no Render"
git push origin main
```

### 2. Criar Web Service no Render

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub/GitLab

### 3. Configurar o Serviço

Preencha os campos:

| Campo | Valor |
|-------|-------|
| **Name** | `entregas-backend` |
| **Region** | `Oregon` (mais próximo do Brasil) |
| **Branch** | `main` ou `master` |
| **Root Directory** | Deixe em branco |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build:server` |
| **Start Command** | `npm run start:prod` |
| **Instance Type** | `Free` |

### 4. Variáveis de Ambiente

Adicione no Render:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `CORS_ORIGIN` | `https://seu-frontend.vercel.app` (ou `*` para desenvolvimento) |

### 5. Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o build (2-5 minutos)
3. Quando estiver verde ✅, o backend está no ar!

---

## 🔌 Configuração do WebSocket

### No Backend (Render)

O Socket.IO já está configurado para produção:

```typescript
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});
```

### No Frontend

Atualize a conexão do Socket.IO:

```typescript
import { io } from 'socket.io-client';

// URL do backend no Render
const BACKEND_URL = 'https://entregas-backend.onrender.com';

const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: Infinity,
});
```

---

## 🧪 Testes

### 1. Health Check

Acesse no navegador:
```
https://entregas-backend.onrender.com/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-03-16T...",
  "pedidos": 2,
  "entregadores": 0,
  "socketsConectados": 0
}
```

### 2. Debug de Sockets

```
https://entregas-backend.onrender.com/debug/sockets
```

### 3. Testar API

```bash
# Listar pedidos disponíveis
curl https://entregas-backend.onrender.com/pedidos/disponiveis

# Criar novo pedido
curl -X POST https://entregas-backend.onrender.com/pedidos \
  -H "Content-Type: application/json" \
  -d '{"cliente":"Teste","endereco":"Rua X","itens":["Item 1"]}'
```

---

## 🔧 Troubleshooting

### WebSocket não conecta

1. Verifique o `CORS_ORIGIN` nas variáveis de ambiente
2. Use ambos os transports: `['websocket', 'polling']`
3. Verifique logs no Render: **Logs** → **View Logs**

### Build falha

```bash
# Teste o build localmente
npm install
npm run build:server

# Deve gerar a pasta dist/index.js
ls dist/
```

### Servidor não inicia

1. Verifique se `PORT` está definido (Render usa porta dinâmica)
2. Logs: **Logs** → **View Logs**
3. Health check falhando? Verifique o endpoint `/health`

### Primeira requisição demora

- Plano Free do Render "dorme" após 15 min de inatividade
- Primeira request após inatividade leva ~30s (cold start)
- Solução: Upgrade para plano pago ou use serviço de uptime monitoring

---

## 📊 URLs Úteis

| Serviço | URL |
|---------|-----|
| Backend | `https://entregas-backend.onrender.com` |
| Health | `https://entregas-backend.onrender.com/health` |
| Pedidos | `https://entregas-backend.onrender.com/pedidos` |
| Debug Sockets | `https://entregas-backend.onrender.com/debug/sockets` |

---

## 🔐 Segurança

### Para produção, configure:

1. **CORS específico**:
   ```
   CORS_ORIGIN=https://seu-app.vercel.app,https://seu-app.netlify.app
   ```

2. **Autenticação** (recomendado):
   - Adicione JWT nas rotas protegidas
   - Valide token no Socket.IO

3. **Rate limiting**:
   ```bash
   npm install express-rate-limit
   ```

---

## 📝 Comandos Úteis

```bash
# Build local
npm run build:server

# Testar produção local
npm run start:prod

# Ver pasta compilada
ls dist/

# Logs em tempo real (Render CLI)
render logs -f entregas-backend
```

---

## ✅ Checklist Final

- [ ] Backend compilado (`dist/index.js` existe)
- [ ] Variáveis de ambiente configuradas no Render
- [ ] CORS_ORIGIN apontando para frontend em produção
- [ ] Health check respondendo
- [ ] WebSocket conectando
- [ ] Frontend usando URL do Render

---

**Pronto!** 🎉 Seu backend está rodando no Render com WebSocket configurado!
