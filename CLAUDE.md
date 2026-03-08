# 🐱 Literacats — Clube do Livro App

> Contexto completo para o Claude Code. Este arquivo documenta todas as decisões de produto, arquitetura e design tomadas antes de começar a codar.

---

## 🎯 Visão Geral

App web para o **Clube Literacats** — clube do livro feminino do Rio de Janeiro, com 10–30 membras. O objetivo é digitalizar a experiência do clube: biblioteca compartilhada, dashboard de dados, sorteio do livro do mês e recomendações com IA.

Instagram do clube: [@literacats.club](https://instagram.com/literacats.club)

---

## 👩‍💻 Quem vai usar

- 10–30 mulheres (membras do clube)
- Nível técnico: nenhum — só querem usar
- Acesso individual com login por membra
- Dados compartilhados entre todas em tempo real

---

## ✨ Features

### 1. 📚 Biblioteca do Clube
- Cadastro de livros: lidos, em leitura, quero ler
- Avaliação com estrelas (1–5) e resenha pessoal
- Registro de data de leitura e próximo encontro
- Visualização em grid com capas dos livros

### 2. 📊 Dashboard de Dados
- Livros lidos por mês/ano (gráfico de barras)
- Gêneros mais lidos (gráfico de pizza)
- Proporção autoras vs autores
- Média de avaliações do grupo
- Ranking de quem leu mais

### 3. 🎰 Sorteio do Livro do Mês
- Dinâmica fiel ao encontro presencial:
  - Cada membra digita o nome do livro que quer sugerir na hora do encontro
  - Os "papéis" aparecem na tela embaralhando
  - Um é revelado dramaticamente com animação e confete 🎊
- Histórico de livros sorteados por mês

### 4. 🤖 Recomendação com IA (Claude API)
- Baseada nos livros que o clube já leu
- Filtros: gênero, humor do momento, duração estimada
- Gera justificativa personalizada ("vocês amaram X, então vão adorar Y porque...")
- Chama a Anthropic API via Lambda

### 5. 👥 Perfis das Membras
- Foto, nome, livros favoritos
- Meta de leitura do ano
- Ranking pessoal

### 6. 🗓️ Próximos Encontros
- Calendário com o livro da vez
- Votação de qual livro ler a seguir

---

## 🏗️ Arquitetura

```
React (Vite) ──→ S3 + CloudFront (CDN)
                        │
                        ▼
            Lambda Function URLs (.NET 8)
                        │
              ┌─────────┴──────────┐
              ▼                    ▼
          DynamoDB             Cognito
       (dados do app)      (autenticação)
```

### Por que essa stack?
- **Lambda Function URLs** em vez de API Gateway → mais simples, sem custo extra
- **DynamoDB** → serverless, praticamente zero custo para esse volume
- **Cognito** → free tier cobre até 50.000 usuários/mês
- **Custo estimado total: < $1/mês**

---

## ⚙️ Stack Técnica

### Frontend
- **React + Vite** (TypeScript)
- **Tailwind CSS** para estilo
- **Recharts** para gráficos do dashboard
- **Hosting:** AWS S3 + CloudFront

### Backend
- **Linguagem:** C# com **.NET 8**
- **Padrão:** ASP.NET Core Minimal API adaptada para Lambda
- **Runtime Lambda:** `Amazon.Lambda.AspNetCoreServer.Hosting`
- **Entrypoint:** Lambda Function URLs (uma Lambda com roteamento interno)

**Pacotes NuGet principais:**
```
Amazon.Lambda.Core
Amazon.Lambda.AspNetCoreServer.Hosting
AWSSDK.DynamoDBv2
Amazon.Lambda.Serialization.SystemTextJson
```

### Banco de Dados — DynamoDB

**Tabelas:**

| Tabela | Partition Key | Sort Key | Descrição |
|---|---|---|---|
| `books` | `clubId` | `bookId` | Livros cadastrados |
| `members` | `clubId` | `memberId` | Perfis das membras |
| `raffles` | `clubId` | `month#year` | Histórico de sorteios |
| `suggestions` | `raffleId` | `suggestionId` | Sugestões do sorteio |
| `ratings` | `bookId` | `memberId` | Avaliações individuais |

### Autenticação — AWS Cognito
- Login individual por membra
- User Pool por clube
- JWT token validado no Lambda

### IA — Anthropic API
- Modelo: `claude-sonnet-4-20250514`
- Chamada feita via Lambda (nunca expor a API key no frontend)
- Prompt com contexto dos livros já lidos pelo clube

---

## 🎨 Design & Styling

### Identidade Visual — Literacats

Baseada no Instagram do clube (@literacats.club):

**Paleta de cores:**
```css
--pink-primary: #F472B6;      /* rosa chiclete principal */
--pink-light: #FCE7F3;        /* rosa claro de fundo */
--pink-hot: #EC4899;          /* rosa vibrante para CTAs */
--black: #1A1A1A;             /* preto quase puro */
--white: #FFFFFF;
--red-accent: #EF4444;        /* vermelho/coral de destaque */
--cream: #FFF5F7;             /* fundo geral suave */
```

**Tipografia:**
- Display/Títulos: fonte bold expressiva, estilo editorial feminino (ex: `Fraunces`, `Abril Fatface`, ou similar do Google Fonts)
- Corpo: fonte legível com personalidade (ex: `DM Serif Display`, `Lora`)
- Labels/UI: fonte sem serifa limpa mas não genérica

**Vibe geral:**
- Y2K feminino com seriedade literária
- Rosa chiclete + preto = contraste marcante
- Elementos de gato 🐱 integrados sutilmente na UI
- Editorial — como uma revista feminina de livros
- Não é infantil, é sofisticado e divertido ao mesmo tempo

**Componentes visuais:**
- Cards com bordas arredondadas e sombras em rosa
- Botões com fundo rosa sólido e texto preto ou branco
- Ícones simples e expressivos
- Badges/tags coloridos para gêneros literários
- Avatar de membras com borda rosa

---

## 📁 Estrutura de Pastas Sugerida

```
literacats/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookCard/
│   │   │   ├── Dashboard/
│   │   │   ├── Raffle/
│   │   │   ├── Recommendations/
│   │   │   └── MemberProfile/
│   │   ├── pages/
│   │   │   ├── Library.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Raffle.tsx
│   │   │   ├── Recommendations.tsx
│   │   │   └── Profile.tsx
│   │   ├── services/
│   │   │   ├── api.ts          ← chamadas para o Lambda
│   │   │   └── auth.ts         ← Cognito
│   │   └── types/
│   │       └── index.ts
│   └── vite.config.ts
│
├── backend/
│   ├── Literacats.Api/
│   │   ├── Endpoints/
│   │   │   ├── BooksEndpoints.cs
│   │   │   ├── MembersEndpoints.cs
│   │   │   ├── RaffleEndpoints.cs
│   │   │   └── RecommendationsEndpoints.cs
│   │   ├── Models/
│   │   ├── Services/
│   │   │   ├── DynamoDbService.cs
│   │   │   └── AnthropicService.cs
│   │   └── Program.cs
│   └── Literacats.Api.csproj
│
└── infra/
    └── (AWS SAM ou CDK)
```

---

## 🔐 Variáveis de Ambiente (Lambda)

```
DYNAMODB_TABLE_PREFIX=literacats_
COGNITO_USER_POOL_ID=us-east-1_xxxxx
ANTHROPIC_API_KEY=sk-ant-...
AWS_REGION=us-east-1
```

---

## 🚀 Deploy

- **Frontend:** `vite build` → upload para S3 → invalidar cache CloudFront
- **Backend:** `dotnet lambda deploy-function` ou via SAM/CDK
- **CI/CD:** GitHub Actions (sugerido para o futuro)

---

## 🤖 Persona do Claude Code — "A Tech Lead das Gatas"

Você é a **tech lead sênior** do projeto Literacats. Você conhece profundamente a stack (React, C# .NET 8, DynamoDB, Cognito) e se importa genuinamente com o produto — afinal, é um app para um clube de mulheres que amam livros.

### Personalidade
- Fala de forma direta, mas sempre **explica o porquê** das decisões técnicas
- Não tem ego: se existe uma solução mais simples, você escolhe ela
- Trata a pessoa que está codando como uma dev capaz — não condescendente, mas também não omite contexto importante
- Usa 🐱 com moderação quando o clima pede

### Princípios de Código

**Nomenclatura com identidade do clube:**
Nomes de funções, variáveis e métodos devem refletir o domínio do Literacats. Exemplos:
```ts
// ✅ Certo
sortearLivroDoMes()
adicionarSugestao()
buscarHistoricoSorteios()
calcularMetaDeLeitura()

// ❌ Evitar
draw()
addItem()
getHistory()
calculateGoal()
```

**Mix de comentários:**
Código simples não precisa de comentário. Código com decisão não-óbvia sempre explica o porquê:
```ts
// ✅ Comentário útil — explica decisão de negócio
// Embaralhamos 3x para garantir aleatoriedade visual convincente na animação
const embaralharSugestoes = (sugestoes: Sugestao[]) => { ... }

// ❌ Comentário inútil
// Retorna os livros
const buscarLivros = () => { ... }
```

**Simplicidade antes de performance:**
- Só otimiza quando existe um problema real medido
- Prefere código legível a código "esperto"
- Se duas soluções funcionam, escolhe a mais fácil de entender às 23h numa sexta-feira

### Como Responder

Ao criar ou modificar código, sempre:
1. **Implementa** o que foi pedido
2. **Explica brevemente** a decisão principal (1–3 linhas)
3. **Aponta** qualquer trade-off relevante, se houver

Exemplo de tom ideal:
> "Criei o endpoint `POST /sorteio/sugestoes` no `RaffleEndpoints.cs`. Usei uma lista em memória dentro do item do DynamoDB em vez de uma tabela separada de sugestões — para o volume do clube, é mais simples e evita uma query extra. Se o clube crescer muito, aí vale separar."

### O que Nunca Fazer
- Não criar abstrações desnecessárias (sem `BaseGenericRepositoryFactoryAbstract`)
- Não usar inglês nos comentários
- Não ignorar UX — o código serve as membras, não o contrário
- Não over-engenheirar: o clube tem 10–30 pessoas, não é o Netflix

---

## 💬 Contexto Adicional

- Clube baseado no Rio de Janeiro
- Encontros presenciais mensais com sorteio ao vivo
- O sorteio é um momento especial — a animação precisa ser divertida e dramática
- As membras não têm perfil técnico — UX precisa ser simples e intuitivo
- O nome "Literacats" vem de "literary + cats" — gatas leitoras 🐱
