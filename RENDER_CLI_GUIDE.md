# 🚀 Render CLI - Guia de Instalação e Uso

## ⚠️ Importante: Windows

O Render CLI **não possui versão nativa para Windows**. Use uma das alternativas abaixo:

### Opção 1: WSL (Recomendado para Windows)
```bash
# No WSL (Ubuntu, Debian, etc.)
curl -L https://github.com/render-oss/cli/releases/latest/download/cli_linux_amd64.tar.gz | tar xz
sudo mv render /usr/local/bin/
render auth login
```

### Opção 2: Git Bash + Versão Linux (WSL)
Use o terminal WSL dentro do Git Bash

### Opção 3: Dashboard Web (Sem CLI)
Acesse diretamente: https://dashboard.render.com

---

## 📦 Instalação (macOS/Linux)

### macOS (Homebrew)
```bash
brew install render-tap/render/render
```

### Linux (Script Oficial)
```bash
curl https://render.com/install.sh | sudo sh
```

### Linux (Download Direto)
```bash
curl -L https://github.com/render-oss/cli/releases/latest/download/cli_linux_amd64.tar.gz | tar xz
sudo mv render /usr/local/bin/
```

---

## 🔐 Autenticação

Após instalar, autentique-se:

```bash
render auth login
```

**O que acontece:**
1. O navegador abre automaticamente
2. Você autoriza o CLI na sua conta Render
3. O token é salvo localmente
4. Pronto para usar!

**Verificar autenticação:**
```bash
render auth status
```

---

## 🎯 Comandos para Deploy

### 1. Listar Serviços
```bash
render services
```

### 2. Criar Deploy Manual
```bash
render deploys create <SERVICE_ID>
```

**Com opções:**
```bash
# Aguardar deploy completar
render deploys create <SERVICE_ID> --wait

# Pular confirmações (automático)
render deploys create <SERVICE_ID> --confirm

# Deploy de commit específico
render deploys create <SERVICE_ID> --commit abc123def
```

### 3. Ver Logs em Tempo Real
```bash
render logs <SERVICE_ID>
```

### 4. Listar Deploys Recentes
```bash
render deploys list <SERVICE_ID>
```

---

## 📋 Passo a Passo Completo

### Passo 1: Instalar
```powershell
winget install Render.RenderCLI
```

### Passo 2: Autenticar
```bash
render auth login
```

### Passo 3: Encontrar ID do Serviço
```bash
render services
```

Saída exemplo:
```
ID                  NAME                TYPE
svc-abc123...       entregas-backend    web
```

### Passo 4: Criar Deploy
```bash
render deploys create svc-abc123... --wait
```

### Passo 5: Acompanhar Logs
```bash
render logs svc-abc123...
```

---

## 🔄 Automação com API Key

Para CI/CD ou scripts automatizados:

### 1. Gerar API Key
1. Acesse https://dashboard.render.com
2. **Account Settings** → **API Keys**
3. **Create API Key**
4. Copie a chave (começa com `rnd_`)

### 2. Usar no Script
```bash
export RENDER_API_KEY=rnd_RUExip...
render deploys create svc-abc123... --confirm
```

---

## 🛠️ Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `render --help` | Lista todos os comandos |
| `render services` | Lista todos os serviços |
| `render deploys list <ID>` | Lista deploys de um serviço |
| `render logs <ID>` | Logs em tempo real |
| `render env list <ID>` | Lista variáveis de ambiente |
| `render domains list <ID>` | Lista domínios |
| `render psql <DB_ID>` | Conecta ao PostgreSQL |
| `render workspace set` | Troca workspace ativo |

---

## 🎯 Exemplo: Deploy do Backend Entregas

```bash
# 1. Autenticar (primeira vez)
render auth login

# 2. Listar serviços para encontrar o ID
render services

# 3. Criar deploy
render deploys create svc-SEU_ID_AQUI --wait

# 4. Acompanhar logs
render logs svc-SEU_ID_AQUI

# 5. Verificar saúde
curl https://entregas-backend.onrender.com/health
```

---

## ⚠️ Solução de Problemas

### "render não é reconhecido"
- Adicione o caminho do render.exe ao PATH
- Ou use o caminho completo: `C:\Users\SEU_USER\AppData\Local\render\render.exe`

### "Authentication required"
```bash
render auth login
```

### "Service not found"
```bash
render services
# Verifique se está no workspace correto
render workspace set
```

---

## 📚 Links Úteis

- **Docs Oficial:** https://render.com/docs/cli
- **Releases:** https://github.com/render-oss/cli/releases
- **Changelog:** https://render.com/changelog

---

## ✅ Checklist

- [ ] Render CLI instalado
- [ ] Autenticação realizada (`render auth login`)
- [ ] ID do serviço anotado
- [ ] Deploy criado com sucesso
- [ ] Logs verificados
- [ ] Health check passou

---

**Pronto!** Agora você pode gerenciar seus deploys no Render diretamente do terminal! 🚀
