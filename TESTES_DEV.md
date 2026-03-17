# 🧪 Guia de Testes - Desenvolvimento Local

## 🚀 Rodar o Projeto (Sem Supabase)

### Método 1: Tudo Junto (Recomendado)

```bash
npm run dev:all
```

Isso roda:
- ✅ Frontend (Next.js) → http://localhost:3000
- ✅ Backend (Socket.IO) → http://localhost:3001

### Método 2: Separadamente

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## 📱 Testar no Navegador

### 1. Página Inicial

**Acesse:** http://localhost:3000

Você verá:
- 🛵 Botão "Sou Entregador"
- 🏪 Botão "Sou Estabelecimento"

---

### 2. Login como Entregador

**Passos:**

1. Clique em **"🛵 Sou Entregador"**
2. Preencha:
   - **Nome:** João Silva
   - **Telefone:** 11999999999
3. Clique em **"Entrar"**

**O que acontece:**
- ✅ Entregador é criado (em memória)
- ✅ Você é redirecionado para `/pedidos`
- ✅ WebSocket conecta automaticamente

---

### 3. Ver Pedidos Disponíveis

**Na tela de pedidos:**

Você verá:
- 📦 Lista de pedidos disponíveis
- Cada pedido mostra:
  - Nome do cliente
  - Endereço
  - Itens do pedido
  - Botão "Aceitar"

**Pedidos iniciais (já vêm cadastrados):**
1. João Silva - Pizza Grande + Refrigerante
2. Maria Santos - Hambúrguer + Batata Frita

---

### 4. Aceitar um Pedido

**Como fazer:**

1. Clique em **"Aceitar"** em um pedido
2. O pedido some da lista "Disponíveis"
3. Vá para aba **"Meus Pedidos"**
4. Você verá o pedido com status "Aceito"

---

### 5. Iniciar Entrega

**Na aba "Meus Pedidos":**

1. Clique em **"Iniciar Entrega"**
2. Status muda para "Em Trânsito"
3. Você é redirecionado para o **Mapa**

---

### 6. Mapa em Tempo Real

**No mapa você vê:**

- 📍 Sua localização (GPS)
- 🏠 Endereço da entrega
- 🛣️ Rota até o cliente

**Botões:**
- 🗺️ "Abrir no Google Maps" - Navegação externa
- 🗺️ "Abrir no Waze" - Navegação externa

---

### 7. Finalizar Entrega

**Depois de navegar:**

1. Volte para `/pedidos`
2. Na aba "Meus Pedidos"
3. Clique em **"Finalizar Entrega"**
4. Status muda para "Entregue" ✅

---

## 🏪 Testar como Estabelecimento

### 1. Acessar Painel

**Acesse:** http://localhost:3000/estabelecimento

### 2. Criar Novo Pedido

**Preencha:**
- **Cliente:** Nome do cliente
- **Endereço:** Endereço completo
- **Itens:** Adicione itens (um por linha)

**Exemplo:**
```
Cliente: Carlos Oliveira
Endereço: Rua Augusta, 1000 - Consolação
Itens:
- X-Bacon
- Batata Frita
- Coca-Cola
```

### 3. Enviar Pedido

**Clique em "Criar Pedido"**

**O que acontece:**
- ✅ Pedido é criado
- ✅ Todos os entregadores conectados recebem notificação
- ✅ Pedido aparece na lista "Disponíveis"

---

## 🔌 Testar WebSocket em Tempo Real

### Cenário: Dois Navegadores

**Passo a passo:**

1. **Navegador 1 (Entregador A):**
   - Faça login como "João" - 11999999999
   - Vá para `/pedidos`

2. **Navegador 2 (Entregador B):**
   - Faça login como "Maria" - 11988888888
   - Vá para `/pedidos`

3. **Navegador 3 (Estabelecimento):**
   - Acesse `/estabelecimento`
   - Crie um novo pedido

**Resultado:**
- ✅ **Ambos entregadores** recebem o pedido ao mesmo tempo!
- ✅ Quando um aceita, o outro vê o pedido sumir
- ✅ Notificações em tempo real!

---

## 📊 Endpoints da API (Backend)

### Testar com curl ou navegador

**Health Check:**
```bash
curl http://localhost:3001/health
```

**Pedidos Disponíveis:**
```bash
curl http://localhost:3001/pedidos/disponiveis
```

**Todos Pedidos:**
```bash
curl http://localhost:3001/pedidos
```

**Debug Sockets:**
```bash
curl http://localhost:3001/debug/sockets
```

---

## 🎯 Fluxo Completo de Teste

### Roteiro Sugerido (5 minutos)

1. **[0:00]** Abra http://localhost:3000
2. **[0:30]** Login como entregador
3. **[1:00]** Ver pedidos disponíveis
4. **[1:30]** Aceitar um pedido
5. **[2:00]** Iniciar entrega
6. **[2:30]** Ver mapa
7. **[3:00]** Finalizar entrega
8. **[3:30]** Abrir estabelecimento em outra aba
9. **[4:00]** Criar novo pedido
10. **[4:30]** Ver notificação em tempo real

---

## ⚠️ Limitações (Sem Supabase)

### O Que Funciona:
- ✅ Login de entregador
- ✅ Criar/aceitar/iniciar/finalizar pedidos
- ✅ WebSocket em tempo real
- ✅ Localização GPS
- ✅ Notificações

### O Que Não Persiste:
- ❌ Dados somem ao reiniciar o backend
- ❌ Não há histórico de corridas
- ❌ Entregadores somem ao desconectar

---

## 🐛 Problemas Comuns

### "Erro ao conectar WebSocket"

**Solução:**
```bash
# Verifique se backend está rodando
curl http://localhost:3001/health

# Se não responder, reinicie:
npm run dev:server
```

### "Página em branco"

**Solução:**
```bash
# Limpe cache do navegador
Ctrl + Shift + Delete

# Ou reinicie o frontend
npm run dev
```

### "Pedidos não atualizam"

**Solução:**
- Verifique console do navegador (F12)
- Veja se WebSocket está conectado
- Recarregue a página (F5)

---

## 📱 Testar no Celular (Mesma Rede)

### 1. Descobrir IP do PC

**Windows (PowerShell):**
```powershell
ipconfig
```

Procure por **IPv4 Address** (ex: `192.168.1.100`)

### 2. Acessar do Celular

**No navegador do celular:**
```
http://192.168.1.100:3000
```

### 3. Permitir Acesso

**No backend (`server/index.ts`):**
- CORS já está configurado como `*` (permite tudo)

---

## ✅ Checklist de Teste

- [ ] Backend rodando (http://localhost:3001/health)
- [ ] Frontend rodando (http://localhost:3000)
- [ ] Login como entregador funciona
- [ ] Pedidos disponíveis aparecem
- [ ] Aceitar pedido funciona
- [ ] Iniciar entrega funciona
- [ ] Mapa abre corretamente
- [ ] Finalizar entrega funciona
- [ ] Criar pedido (estabelecimento) funciona
- [ ] WebSocket atualiza em tempo real
- [ ] Testar em 2 navegadores simultaneamente

---

## 🎉 Pronto para Testar!

**Comandos:**
```bash
# Rodar tudo
npm run dev:all

# Acessar
http://localhost:3000
```

**Dúvidas?** Veja os logs no terminal!
