# 🚀 Deploy Literacats

Guia passo-a-passo pra subir o app: **Vercel** (frontend) + **AWS Lambda** + **DynamoDB**.

Custo estimado: **~$0/mês** (free tier cobre o uso de um clube de 30 mulheres com folga).

---

## 0. Pré-requisitos (uma vez na vida)

### 0.1 Conta AWS
1. Cria conta em [aws.amazon.com](https://aws.amazon.com) (precisa cartão pra ativar — não cobra se ficar no free tier)
2. **Configura billing alert em $5** pra evitar surpresa: Billing → Budgets → Create budget
3. **NÃO use o root user pra deploy.** Cria um IAM user dedicado:
   - Console → IAM → Users → Create user
   - Nome: `literacats-deploy`
   - Anexa essas managed policies:
     - `AWSLambda_FullAccess`
     - `AmazonDynamoDBFullAccess`
     - `IAMFullAccess` _(precisa pra criar a role da Lambda)_
     - `AmazonS3FullAccess` _(o `dotnet lambda` faz upload do pacote)_
     - `CloudWatchLogsFullAccess`
   - Security credentials → Create access key → escolhe "CLI"
   - **Guarda o `Access Key ID` e `Secret Access Key`** (não vai conseguir ver o secret de novo)

### 0.2 Ferramentas locais

#### AWS CLI v2 (Linux/WSL)
```bash
# O 'apt install awscli' instala uma versão v1 obsoleta — use o instalador oficial:
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt install -y unzip
unzip awscliv2.zip
sudo ./aws/install
aws --version

# Configura com a access key da IAM user
aws configure
# AWS Access Key ID: <cola aqui>
# AWS Secret Access Key: <cola aqui>
# Default region: us-east-1
# Default output format: json
```

#### .NET Lambda Tools
```bash
dotnet tool install -g Amazon.Lambda.Tools
```

#### Vercel CLI
```bash
npm install -g vercel
```

---

## 1. Backend → AWS Lambda + DynamoDB

### 1.1 Criar a tabela DynamoDB
```bash
cd backend/scripts
bash create-table-aws.sh
```

Saída esperada:
```
🐱 Criando tabela 'literacats' em us-east-1...
⏳ Esperando tabela ficar ATIVA...
✅ Tabela 'literacats' criada com sucesso!
```

### 1.2 Popular dados iniciais (4 livros + 5 membras)
```bash
bash seed-data-aws.sh
```

### 1.3 Deploy da Lambda
```bash
cd ../Literacats.Api
dotnet lambda deploy-function literacats-api
```

Vai te perguntar:
- **IAM role:** escolhe `*** Create new IAM Role ***` na primeira vez
- **Role name:** `literacats-lambda-role`
- **Permissions policy:** `AWSLambdaBasicExecutionRole` (acesso ao CloudWatch Logs)

Quando terminar, vai imprimir um ARN tipo:
```
arn:aws:lambda:us-east-1:123456789:function:literacats-api
```

### 1.4 Dar permissão de DynamoDB pra Lambda
A role criada não tem acesso ao DynamoDB ainda. Adiciona:
```bash
aws iam attach-role-policy \
    --role-name literacats-lambda-role \
    --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
```

### 1.5 Habilitar Function URL (endpoint HTTP público)
```bash
aws lambda create-function-url-config \
    --function-name literacats-api \
    --auth-type NONE \
    --cors '{"AllowOrigins":["*"],"AllowMethods":["*"],"AllowHeaders":["*"]}'
```

Saída tem um campo `FunctionUrl`. **Copia essa URL** — algo tipo:
```
https://abc123xyz.lambda-url.us-east-1.on.aws/
```

E permite invocação pública (necessário pra Function URL):
```bash
aws lambda add-permission \
    --function-name literacats-api \
    --statement-id FunctionURLAllowPublicAccess \
    --action lambda:InvokeFunctionUrl \
    --principal "*" \
    --function-url-auth-type NONE
```

### 1.6 Testa
```bash
curl https://SUA-URL.lambda-url.us-east-1.on.aws/livros
```

Deve retornar JSON com os 4 livros.

---

## 2. Frontend → Vercel

### 2.1 Login
```bash
cd ../../frontend
vercel login
```

### 2.2 Primeiro deploy (preview)
```bash
vercel
```

Responde:
- **Set up and deploy:** Y
- **Scope:** sua conta pessoal
- **Link to existing project:** N
- **Project name:** literacats
- **Directory:** `./` (default)
- **Override settings:** N

Vai dar build e deploy. No final imprime uma URL `https://literacats-xxx.vercel.app`.

### 2.3 Adicionar a env var `VITE_API_URL`

No painel da Vercel ([vercel.com/dashboard](https://vercel.com/dashboard)) → projeto literacats → Settings → Environment Variables:

| Key | Value | Environment |
|---|---|---|
| `VITE_API_URL` | `https://SUA-URL.lambda-url.us-east-1.on.aws` _(sem barra final)_ | Production, Preview, Development |

### 2.4 Deploy de produção
```bash
vercel --prod
```

A URL final é tipo `https://literacats.vercel.app`.

---

## 3. Conectar CORS (Lambda aceitar Vercel)

Agora que você tem a URL da Vercel, atualiza o Lambda pra liberar CORS:
```bash
aws lambda update-function-configuration \
    --function-name literacats-api \
    --environment 'Variables={UseDynamoDB=true,DynamoDB__TableName=literacats,AllowedOrigins__0=https://literacats.vercel.app}'
```

> Substitua `https://literacats.vercel.app` pela sua URL real.

---

## 4. Pronto 🎉

Abre `https://literacats.vercel.app` → tela de login com as 5 membras. Cada uma cria PIN no primeiro acesso.

---

## 🔄 Como atualizar depois

### Backend (mudou C#)
```bash
cd backend/Literacats.Api
dotnet lambda deploy-function literacats-api
```

### Frontend (mudou TS)
```bash
cd frontend
vercel --prod
```

(Ou conecta o repo no painel da Vercel pra deploy automático a cada push.)

---

## 🌐 Custom domain (opcional)

1. Compra `literacats.club` no [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) (~$10/ano)
2. Vercel → Project → Settings → Domains → Add `literacats.club`
3. Vercel mostra os DNS records pra adicionar no Cloudflare
4. ~5min depois, `https://literacats.club` funciona com SSL automático

---

## 🐛 Troubleshooting

**"Access denied" no `dotnet lambda deploy`:**
A IAM user precisa de `IAMFullAccess` (pra criar a role da Lambda). Adiciona temporariamente, depois pode tirar.

**Lambda retorna 500 em qualquer endpoint:**
Verifica logs:
```bash
aws logs tail /aws/lambda/literacats-api --follow
```
Geralmente é a Lambda role sem permissão de DynamoDB. Roda o passo 1.4.

**CORS error no console do navegador:**
A `AllowedOrigins__0` no Lambda precisa ser **exatamente** a URL da Vercel (sem `/` no fim). Refaz o passo 3.

**`vercel build` falha por causa do `VITE_API_URL`:**
A env var precisa estar configurada **antes** do `vercel --prod`. Se esqueceu, configura no painel e roda `vercel --prod` de novo.

---

## 💰 Monitorando custo

```bash
# Quanto tá usando essa conta no mês
aws ce get-cost-and-usage \
    --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
    --granularity MONTHLY \
    --metrics UnblendedCost
```

Pra 30 mulheres com uso normal, isso vai mostrar **$0,00** todo mês. Se passar de $1, te avisa o billing alert que você configurou no passo 0.1.

---

## 🔒 Pós-deploy: tightening da segurança

Depois que tudo tá funcionando:
1. **Tira `IAMFullAccess`** da IAM user `literacats-deploy` (não precisa mais — a role da Lambda já existe)
2. Roda `aws configure` de novo se quiser **rotacionar** as access keys
3. Considera deletar a IAM user de deploy quando não for atualizar mais (recria quando precisar)
