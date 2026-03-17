# 🌐 Deploy no Render via Dashboard Web

## ✅ Método Recomendado (Funciona no Windows)

Não é necessário CLI! Você pode gerenciar tudo pelo dashboard web.

---

## 🎯 Passo a Passo Completo

### 1. Acessar o Dashboard
```
https://dashboard.render.com
```

### 2. Fazer Login
- Clique em **Sign In**
- Use sua conta GitHub (recomendado) ou email

### 3. Selecionar o Serviço
- Clique em **entregas-backend** na lista de serviços

---

## 🔄 Criar Novo Deploy

### Método 1: Auto Deploy (Automático)
Se **Auto Deploy** está ativado:
1. Faça push para branch `main`
2. Render detecta automaticamente
3. Deploy inicia em ~30 segundos

### Método 2: Deploy Manual
1. No serviço **entregas-backend**
2. Clique em **Manual Deploy** (canto superior direito)
3. Selecione a branch: `main`
4. Clique em **Deploy**
5. Aguarde o build (2-5 minutos)

### Método 3: Clear Cache + Deploy
Se o build está falhando:

1. **Settings** → **Build Settings**
2. Clique em **Clear build cache**
3. Volte em **Overview** ou **Logs**
4. Faça **Manual Deploy**

---

## 📊 Acompanhar Deploy

### Ver Logs em Tempo Real
1. Clique em **Logs** no menu lateral
2. Selecione **Deploy** para ver logs do build
3. Ou **Service** para ver logs do serviço rodando

### Verificar Status
- 🟢 **Success**: Deploy completou
- 🟡 **Building**: Deploy em andamento
- 🔴 **Failed**: Deploy falhou (clique para ver logs)

---

## 🛠️ Gerenciar Serviço

### Variáveis de Ambiente
1. **Environment** no menu lateral
2. Clique em **Add Environment Variable**
3. Adicione:
   ```
   KEY: NODE_ENV
   VALUE: production
   
   KEY: PORT
   VALUE: 10000
   
   KEY: CORS_ORIGIN
   VALUE: *
   ```
4. Clique em **Save Changes**
5. **Manual Deploy** para aplicar

### Domínios
1. **Domains** no menu lateral
2. Domínio gratuito: `entregas-backend.onrender.com`
3. Ou adicione domínio customizado

### Health Check
1. **Settings** → **Health Check Path**
2. Configure: `/health`
3. **Save Changes**

---

## 🧪 Testar Deploy

### Health Check
```
https://entregas-backend.onrender.com/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-03-17T...",
  "pedidos": 2,
  "entregadores": 0,
  "socketsConectados": 0
}
```

### Debug de Sockets
```
https://entregas-backend.onrender.com/debug/sockets
```

---

## ⚠️ Solução de Problemas

### Build Falha
1. **Logs** → Veja o erro completo
2. **Settings** → **Clear build cache**
3. **Manual Deploy** novamente

### "Cannot find module"
- Verifique se `typescript` está em `dependencies`
- Clear build cache e redeploy

### WebSocket não conecta
- Verifique `CORS_ORIGIN` nas variáveis de ambiente
- Use `transports: ['websocket', 'polling']` no frontend

### Primeira request demora
- Plano Free "dorme" após 15 min de inatividade
- Cold start: ~30-50 segundos
- Solução: Upgrade para plano pago

---

## 📱 Atalhos Úteis

| Ação | URL |
|------|-----|
| Dashboard | https://dashboard.render.com |
| Serviços | https://dashboard.render.com/services |
| Seu Backend | https://dashboard.render.com/detail/web/SEU_ID |
| Logs | https://dashboard.render.com/logs/SEU_ID |

---

## 🎯 Fluxo de Trabalho Recomendado

### Desenvolvimento
```bash
# 1. Fazer alterações
# 2. Testar localmente
npm run build:server
npm run start:prod

# 3. Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push
```

### Produção
1. Push para `main` aciona auto deploy
2. Acompanhe em: https://dashboard.render.com
3. Teste: https://entregas-backend.onrender.com/health

---

## ✅ Checklist de Deploy

- [ ] Login no dashboard.render.com
- [ ] Selecionar serviço entregas-backend
- [ ] Verificar variáveis de ambiente
- [ ] Clear build cache (se necessário)
- [ ] Manual Deploy
- [ ] Acompanhar logs
- [ ] Testar health check
- [ ] Verificar WebSocket

---

## 🔗 Links Úteis

- **Dashboard:** https://dashboard.render.com
- **Docs Render:** https://render.com/docs
- **Status Render:** https://status.render.com
- **Suporte:** https://render.com/support

---

**Pronto!** Agora você pode gerenciar seus deploys pelo dashboard web! 🚀
