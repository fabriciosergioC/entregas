# 🚀 Guia de Deploy - Produção

## Visão Geral

- **Backend (Express + Socket.io)** → Render
- **Frontend (Next.js)** → Netlify

---

## 1️⃣ Backend no Render

### Passos:

1. **Suba o código para o GitHub**
   ```bash
   git remote add origin https://github.com/fabriciosergioC/entregas.git
   git push -u origin master
   ```

2. **Acesse [render.com](https://render.com)**
   - Faça login com GitHub
   - Clique em **"New +"** → **"Web Service"**

3. **Conecte o repositório**
   - Selecione `entregas`
   - Preencha:
     - **Name**: `entregas-backend`
     - **Region**: Oregon (padrão)
     - **Branch**: `master`
     - **Root Directory**: (deixe em branco)
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npx ts-node server/index.ts`
     - **Instance Type**: `Free`

4. **Variáveis de Ambiente** (em "Environment"):
   ```
   NODE_ENV = production
   PORT = 10000
   ```

5. **Clique em "Create Web Service"**

6. **Aguarde o deploy** (~2-5 minutos)
   - URL será: `https://entregas-backend.onrender.com`

7. **Teste o health check**:
   ```
   https://entregas-backend.onrender.com/health
   ```

---

## 2️⃣ Frontend no Netlify

### Passos:

1. **Acesse [netlify.com](https://netlify.com)**
   - Faça login com GitHub

2. **Adicione novo site**
   - **"Add new site"** → **"Import an existing project"**
   - Conecte o repositório `entregas`

3. **Configure o build**:
   - **Branch**: `master`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next` (o Netlify detecta automaticamente)

4. **Variáveis de Ambiente** (em "Site settings" → "Build & deploy" → "Environment"):
   ```
   NEXT_PUBLIC_API_URL = https://entregas-backend.onrender.com
   NEXT_PUBLIC_SOCKET_URL = https://entregas-backend.onrender.com
   ```

5. **Clique em "Deploy site"**

6. **Aguarde o build** (~3-5 minutos)
   - URL será: `https://seu-site.netlify.app`

---

## 3️⃣ Atualizações Futuras

### Backend (Render):
- O Render faz **auto-deploy** quando você faz push no GitHub
- Para ver logs: Dashboard → Seu serviço → "Logs"

### Frontend (Netlify):
- O Netlify faz **auto-deploy** quando você faz push no GitHub
- Para ver logs: Dashboard → Seu site → "Deploys" → Clique no deploy

---

## ⚠️ Importante

### Plano Free do Render:
- O servidor **dorme após 15 minutos de inatividade**
- Primeira requisição pode levar ~30 segundos para "acordar"
- Para evitar: use serviço pago ($7/mês) ou faça requests a cada 15min

### WebSocket no Render:
- Funciona no plano free
- Pode haver reconexões ocasionais

---

## 🧪 Testes

1. **Backend**:
   ```
   https://entregas-backend.onrender.com/health
   ```

2. **Frontend**:
   - Acesse a URL do Netlify
   - Faça login como entregador
   - Verifique se os pedidos aparecem

---

## 🔧 Troubleshooting

### Backend não inicia:
- Verifique logs no Render
- Confirme que `ts-node` está nas dependências (está ✅)

### Frontend não conecta na API:
- Verifique variáveis de ambiente no Netlify
- Confirme URLs em `.env.example`

### WebSocket não conecta:
- Render suporta WebSocket nativamente
- Verifique se `NEXT_PUBLIC_SOCKET_URL` está correto

---

## 📱 URLs Finais

| Serviço | URL |
|---------|-----|
| Backend | `https://entregas-backend.onrender.com` |
| Frontend | `https://seu-site.netlify.app` |
