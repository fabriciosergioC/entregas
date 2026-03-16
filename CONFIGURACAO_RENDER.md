# ✅ Configuração Completa - Deploy Backend no Render

## 📋 Resumo das Configurações

### 1. Build Command no Render
```bash
npm install && npm run build:server
```

### 2. Start Command no Render
```bash
npm run start:prod
```

### 3. Variáveis de Ambiente
| Chave | Valor |
|-------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `CORS_ORIGIN` | `https://seu-frontend.vercel.app` ou `*` |

---

## 🔧 Configurações dos Arquivos

### render.yaml
```yaml
services:
  - type: web
    name: entregas-backend
    env: node
    region: oregon
    plan: free
    buildCommand: npm install && npm run build:server
    startCommand: npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: CORS_ORIGIN
        value: '*'
    healthCheckPath: /health
    autoDeploy: true
```

### package.json (scripts importantes)
```json
{
  "scripts": {
    "build:server": "tsc --project tsconfig.server.json",
    "start:prod": "node dist/index.js"
  }
}
```

### tsconfig.server.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./server"
  },
  "include": ["server/index.ts"]
}
```

### server/index.ts (WebSocket config)
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

---

## 🚀 Passo a Passo

1. **Commitar alterações**
   ```bash
   git add .
   git commit -m "Configurar deploy Render"
   git push origin main
   ```

2. **Criar Web Service no Render**
   - Acesse: https://dashboard.render.com
   - New + → Web Service
   - Conecte seu repositório

3. **Configurar**
   - Build Command: `npm install && npm run build:server`
   - Start Command: `npm run start:prod`
   - Variáveis de ambiente (veja acima)

4. **Deploy**
   - Clique em "Create Web Service"
   - Aguarde 2-5 minutos

5. **Testar**
   - Health: `https://seu-backend.onrender.com/health`
   - Debug: `https://seu-backend.onrender.com/debug/sockets`

---

## 🔌 Frontend - Conexão WebSocket

```typescript
import { io } from 'socket.io-client';

const BACKEND_URL = 'https://seu-backend.onrender.com';

const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: Infinity,
});
```

---

## 🧪 Testes de API

```bash
# Health check
curl https://seu-backend.onrender.com/health

# Listar pedidos
curl https://seu-backend.onrender.com/pedidos/disponiveis

# Criar pedido
curl -X POST https://seu-backend.onrender.com/pedidos \
  -H "Content-Type: application/json" \
  -d '{"cliente":"Teste","endereco":"Rua X","itens":["Item 1"]}'
```

---

## 📁 Estrutura do Projeto

```
entregas-master/
├── server/
│   └── index.ts              # Código do backend
├── tsconfig.server.json      # Config TypeScript servidor
├── render.yaml               # Config Render
├── package.json              # Scripts e dependências
├── .gitignore                # Ignora node_modules, dist
├── .env.example              # Exemplo de variáveis
├── DEPLOY_RENDER.md          # Guia rápido
└── RENDER_DEPLOY.md          # Guia completo
```

---

## ⚠️ Importante

- **Não commitar** a pasta `dist/` (já está no `.gitignore`)
- **Não commitar** o arquivo `.env` (use `.env.example`)
- **Sempre testar** o build localmente antes de deploy:
  ```bash
  npm run build:server
  npm run start:prod
  ```

---

## 🔗 Links Úteis

- Dashboard Render: https://dashboard.render.com
- Documentação Render: https://render.com/docs
- Socket.IO Docs: https://socket.io/docs/v4/

---

**Status:** ✅ Configurado e testado!
