# 🗺️ Navegação com Apps Externos (Sem Permissão de GPS)

## ✅ Nova Funcionalidade

Agora você pode usar **Google Maps** ou **Waze** diretamente para navegação, **sem precisar de permissão de localização no navegador**!

---

## 📱 Como Usar

### **1. Após aceitar o pedido:**

1. Vá em **Pedidos** → **Aceite um pedido**
2. Clique em **"Iniciar Entrega"**
3. Você será redirecionado para a tela de **Mapa**

### **2. Usando navegação externa:**

Na tela do mapa, você verá dois botões:

```
┌─────────────────┬─────────────────┐
│  🗺️ Google     │  🚗 Waze        │
│     Maps        │                 │
└─────────────────┴─────────────────┘
```

**Toque em um dos botões:**
- **Google Maps** - Usa o app do Google Maps
- **Waze** - Usa o app do Waze

### **3. O app será aberto automaticamente:**

- O endereço do pedido já vai preenchido
- A rota é calculada automaticamente
- **Não precisa de permissão de localização!**

---

## 🎯 Vantagens

| GPS no Navegador | Apps Externos (Maps/Waze) |
|------------------|---------------------------|
| ❌ Precisa de permissão | ✅ Sem permissão |
| ❌ Pode falhar | ✅ Funciona sempre |
| ❌ Consome mais bateria | ✅ Otimizado |
| ❌ Menos preciso | ✅ GPS nativo do celular |
| ❌ Sem aviso de trânsito | ✅ Waze mostra trânsito |

---

## 🔧 Como Funciona

Quando você clica em **"Google Maps"** ou **"Waze"**:

1. O sistema pega as coordenadas do destino
2. Abre o app escolhido em uma nova aba
3. O app nativo já inicia a navegação

**URLs usadas:**
- Google Maps: `https://www.google.com/maps/dir/?api=1&destination=LAT,LNG`
- Waze: `https://waze.com/ul?ll=LAT,LNG&navigate=yes`

---

## 📲 Requisitos

### **No celular:**
- ✅ Ter **Google Maps** ou **Waze** instalado
- ✅ GPS do celular ativado (configurações do sistema)
- ✅ Conexão com internet

### **Não precisa:**
- ❌ Permissão de localização no navegador
- ❌ Manter a página do app aberta
- ❌ GPS via navegador

---

## 🚀 Fluxo Completo

```
1. Login no app
   ↓
2. Aceitar pedido
   ↓
3. Clicar em "Iniciar Entrega"
   ↓
4. Clicar em "Google Maps" ou "Waze"
   ↓
5. Navegação inicia no app escolhido ✅
```

---

## 💡 Dicas

### **Escolhendo o app:**

- **Google Maps**: Melhor para quem não tem Waze
- **Waze**: Melhor para evitar trânsito e radares

### **Se não abrir o app:**

1. Verifique se o app está instalado
2. Tente o outro botão (Maps ou Waze)
3. O link abre em nova aba - volte para o app e minimize

### **GPS do celular:**

Mesmo sem permissão no navegador, o **GPS do celular precisa estar ativado**:

- Android: Deslize para baixo → Ative **"Localização"**
- iPhone: Ajustes → Privacidade → Localização → Ative

---

## 🆘 Problemas Comuns

### "App não abriu"
- Verifique se está instalado
- Tente o outro app (Maps ou Waze)
- Navegador pode bloquear - tente Chrome ou Firefox

### "Não tem GPS no app"
- Ative o GPS nas configurações do celular
- Verifique permissões do app Maps/Waze (não do navegador)

### "Endereço errado"
- O endereço vem do pedido
- Se estiver errado, corrija no estabelecimento antes de enviar

---

## 🎭 GPS no Navegador (Opcional)

O botão **"▶️ Iniciar GPS"** ainda existe, mas é **opcional**:

- Use se quiser ver a localização no mapa do app
- Requer permissão de localização
- Útil para debug ou se não quiser usar apps externos

---

## 📞 Resumo

**Antes:**
- Precisava de permissão de GPS no navegador
- Muitos erros de permissão
- Não funcionava em alguns celulares

**Agora:**
- ✅ Clica no botão
- ✅ Abre Google Maps ou Waze
- ✅ Navegação funciona perfeitamente
- ✅ Sem permissão de navegador necessária

**Simples assim!** 🎉
