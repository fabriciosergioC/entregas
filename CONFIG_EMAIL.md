# 🔧 Configuração de Email no Supabase

## ❌ Erro Comum: Email de Confirmação Não Envia

Se você está recebendo erro ao enviar email de confirmação, siga os passos abaixo:

---

## ✅ Solução 1: Desativar Confirmação de Email (Desenvolvimento)

Para **desenvolvimento**, você pode desativar a confirmação de email:

### No Dashboard do Supabase:

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Authentication** → **Settings**
4. Desça até **Email Auth**
5. **Desmarque** a opção: `Enable email confirmations`
6. Clique em **Save**

```
┌─────────────────────────────────────────┐
│ Email Auth                              │
│                                         │
│ ☑ Enable Email Signup                   │
│ ☐ Enable email confirmations ← DESMARCAR│
│ ☐ Enable double opt-in                  │
│                                         │
│ [Save Changes]                          │
└─────────────────────────────────────────┘
```

### Resultado:
- ✅ Usuários podem fazer login imediatamente após cadastro
- ✅ Sem necessidade de confirmar email
- ⚠️ **Apenas para desenvolvimento!**

---

## ✅ Solução 2: Configurar SMTP Próprio (Produção)

Para **produção**, configure um servidor SMTP:

### No Dashboard do Supabase:

1. **Authentication** → **Settings**
2. Role até **SMTP Settings**
3. Clique em **Configure SMTP**

### Preencha os dados:

```
Sender email: noreply@seuapp.com
Sender name: App de Entregas
Host: smtp.seu-provedor.com
Port: 587
Username: seu-usuario-smtp
Password: sua-senha-smtp
```

### Exemplos de SMTP:

#### Gmail:
```
Host: smtp.gmail.com
Port: 587
Username: seu-email@gmail.com
Password: senha-de-app (não é sua senha normal!)
```

#### SendGrid:
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: sua-api-key-sendgrid
```

#### Mailgun:
```
Host: smtp.mailgun.org
Port: 587
Username: postmaster@seu-domínio.mailgun.org
Password: sua-senha-mailgun
```

---

## ✅ Solução 3: Usar Plano Pago do Supabase

O Supabase inclui envio de emails no **plano Pro** ($25/mês):

- 100,000 emails/mês incluídos
- Configuração automática
- Sem necessidade de SMTP externo

### Para ativar:

1. **Settings** → **Billing**
2. Faça upgrade para **Pro Plan**
3. Emails serão enviados automaticamente

---

## 🔍 Verificar Status do Email

### No Dashboard:

1. **Authentication** → **Email Templates**
2. Verifique se os templates estão configurados

### Templates Disponíveis:

- **Confirm signup** - Confirmação de cadastro
- **Magic link** - Login mágico
- **Recover** - Recuperação de senha
- **Email change** - Mudança de email

---

## 🛠️ Testar Envio de Email

### 1. Criar Usuário de Teste:

```bash
# No console do navegador (F12)
const { data, error } = await supabase.auth.signUp({
  email: 'teste@email.com',
  password: 'senha123',
});

console.log(data, error);
```

### 2. Verificar Logs:

1. **Authentication** → **Logs**
2. Filtre por **Auth**
3. Veja se há erros de envio

---

## ⚠️ Erros Comuns

### Erro: "SMTP connection failed"

**Causa:** SMTP não configurado ou credenciais inválidas

**Solução:**
```
1. Verifique credenciais do SMTP
2. Teste conexão com servidor SMTP
3. Verifique se porta 587 está liberada
```

### Erro: "Email sending disabled"

**Causa:** SMTP não configurado e plano free não inclui emails

**Solução:**
```
Opção A: Desativar confirmação de email (desenvolvimento)
Opção B: Configurar SMTP próprio
Opção C: Upgrade para plano Pro
```

### Erro: "Rate limit exceeded"

**Causa:** Limite de emails excedido (plano free: 4 emails/hora)

**Solução:**
```
1. Aguarde 1 hora
2. Ou configure SMTP próprio (sem limite)
3. Ou faça upgrade para Pro
```

---

## 📊 Limites de Email por Plano

| Plano | Emails Incluídos | Custo Extra |
|-------|-----------------|-------------|
| **Free** | 0 (precisa de SMTP) | - |
| **Pro** | 100,000/mês | $25/mês |
| **Team** | 100,000/mês | $25/mês + $30/membro |
| **Enterprise** | Ilimitado | Sob consulta |

---

## 🚀 Configuração Recomendada

### Para Desenvolvimento:

```
✅ Desativar email confirmations
✅ Usar emails de teste (@example.com)
✅ Não precisa de SMTP
```

### Para Produção:

```
✅ Ativar email confirmations
✅ Configurar SMTP (SendGrid, Mailgun, etc.)
✅ Ou usar plano Pro do Supabase
✅ Configurar domínio próprio nos emails
```

---

## 📝 Código para Contornar Erro

### No Login (tratamento de erro):

```typescript
if (error.message.includes('Email not confirmed')) {
  // Opção 1: Mostrar mensagem amigável
  setErro('Email não confirmado. Verifique sua caixa de entrada.');
  
  // Opção 2: Reenviar email de confirmação
  const { error: resendError } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  });
  
  if (resendError) {
    setErro('Erro ao reenviar email. Tente novamente.');
  } else {
    setErro('Email de confirmação reenviado!');
  }
}
```

---

## 🔗 Links Úteis

- [Supabase Email Docs](https://supabase.com/docs/guides/auth/auth-email)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

---

**Recomendação:** Para desenvolvimento, **desative a confirmação de email**. Para produção, use **SMTP próprio** ou **plano Pro**! 🎯
