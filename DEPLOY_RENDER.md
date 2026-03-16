# ⚡ Guia Rápido - Deploy Backend no Render

## 🚀 Deploy em 5 minutos

### 1. Preparar código (1 min)
```bash
git add .
git commit -m "Configurar deploy Render"
git push origin main
```

### 2. Criar serviço no Render (2 min)
1. Acesse https://dashboard.render.com
2. **New +** → **Web Service**
3. Conecte seu repositório GitHub

### 3. Configurar (1 min)
| Campo | Valor |
|-------|-------|
| Build Command | `npm install && npm run build:server` |
| Start Command | `npm run start:prod` |
| Environment Variables | `NODE_ENV=production`, `PORT=10000`, `CORS_ORIGIN=*` |

### 4. Deploy (1 min)
- Clique em **Create Web Service**
- Aguarde build ficar verde ✅

### 5. Testar (30 seg)
```
https://SEU-SERVICO.onrender.com/health
```

---

## 🔌 WebSocket no Frontend

```typescript
import { io } from 'socket.io-client';

const socket = io('https://SEU-SERVICO.onrender.com', {
  transports: ['websocket', 'polling'],
  reconnection: true,
});
```

---

## 📁 Arquivos de Configuração

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

### package.json (scripts)
```json
{
  "scripts": {
    "build:server": "tsc --project tsconfig.server.json",
    "start:prod": "node dist/index.js"
  }
}
```

---

## ✅ Pronto!

Backend + WebSocket rodando no Render!

📖 **Guia completo:** `RENDER_DEPLOY.md`
