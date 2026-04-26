# Tasks — Literacats

Lista de tarefas pendentes para o desenvolvimento do app.

---

## Próximo: Deploy

- [ ] **Configurar credenciais AWS** (`aws configure`)
- [ ] **Deploy do frontend** — `vite build` → S3 + CloudFront
- [ ] **Deploy do backend** — Lambda Function URL (.NET 8)
- [ ] **Criar tabela DynamoDB na AWS** + seed com dados reais
- [ ] **Domínio e HTTPS** — domínio customizado + certificado SSL no CloudFront

---

## Próximas Tasks

### Dados Reais

- [ ] **Adicionar membras reais do clube** — atualizar seed com nomes, bios, etc.
- [ ] **Adicionar livros reais** — histórico completo do clube

### Autenticação (pós-MVP)

- [ ] **Implementar login com AWS Cognito**
  - Criar User Pool no Cognito
  - Integrar `amazon-cognito-identity-js` no frontend
  - Criar contexto de autenticação (`AuthContext`)
  - Proteger rotas que precisam de login
  - Tela de login/cadastro funcional

### Frontend

- [ ] **Página de cadastro de livro**
  - Formulário para adicionar novo livro à biblioteca
  - Buscar dados do livro por ISBN (Open Library API)
  - Upload de capa manual (fallback)

- [ ] **Melhorar página de Recomendações IA**
  - Integrar com Lambda + Claude API
  - Mostrar loading mais elaborado
  - Histórico de recomendações anteriores

- [ ] **Histórico de sorteios**
  - Página com todos os sorteios passados
  - Qual livro ganhou em cada mês
  - Quem sugeriu o livro vencedor

- [ ] **Perfil da membra**
  - Editar foto de perfil
  - Cadastro de livros favoritos
  - Meta literária visível no perfil público

- [ ] **Biblioteca**
  - Permitir favoritar um livro vinculando ao perfil
  - Destaque no livro do mês

---

### Backend

- [ ] **Endpoint de recomendação IA**
  - `POST /recomendacoes` — enviar contexto para Claude
  - Montar prompt com histórico do clube
  - Retornar sugestão formatada

---

### Infra

- [ ] **CI/CD com GitHub Actions**
  - Build e deploy automático do frontend (S3)
  - Build e deploy do backend (Lambda)

---

## Concluídas

- [x] Criar projeto frontend (React + Vite + TypeScript + Tailwind)
- [x] Configurar paleta de cores Literacats
- [x] Página Biblioteca com capas de livros (Open Library API)
- [x] Página de detalhes do livro
- [x] Dashboard do clube com gráficos
- [x] Página de Sorteio com animação e confete
- [x] Página de Recomendações IA (mock)
- [x] Página Meu Perfil com estatísticas e conquistas
- [x] Página de listagem de Membras
- [x] Perfil público de cada membra
- [x] Navbar com avatar de usuário logado
- [x] **Backend .NET 8 Minimal API** (endpoints livros, membras, sorteio)
- [x] **Integração Frontend ↔ Backend** (API service no React)
- [x] **Arquitetura DynamoDB** (IDataService, InMemoryDataService, DynamoDbService)
- [x] **Integração DynamoDB Local** — Docker + tabela + seed + backend conectado
- [x] **Responsividade mobile** — Navbar hamburguer + ajustes em todas as páginas
- [x] **Dados reais (parcial)** — Camila (@camis) + "Nem Todo Outono É Igual" (Misty Wilson)
- [x] **Avaliação de livros** — estrelas + resenha, endpoint `GET /livros/{id}/avaliacoes`, UI funcional
- [x] **App coletivo** — removido conceito de login, rota /perfil removida
- [x] **Título e favicon** — "Literacats 🐱" + emoji de gato
- [x] **JsonStringEnumConverter** — enums serializados como string no backend

---

## Ideias Futuras

- [ ] Notificações (lembrete do encontro, novo livro sorteado)
- [ ] Chat/comentários por livro
- [ ] Integração com Goodreads
- [ ] App mobile (React Native ou PWA)
- [ ] Gamificação (mais badges, ranking mensal)
- [ ] Modo escuro

---

## Como Subir o Ambiente Local

1. Subir DynamoDB Local:
   ```bash
   docker start dynamodb-local || docker run -d --name dynamodb-local -p 8000:8000 amazon/dynamodb-local
   ```
2. Criar tabela (só na primeira vez):
   ```bash
   cd backend/scripts && bash create-table.sh
   ```
3. Popular dados (só na primeira vez):
   ```bash
   bash seed-data.sh
   ```
4. Rodar backend:
   ```bash
   cd backend/Literacats.Api && dotnet run
   ```
5. Rodar frontend:
   ```bash
   cd frontend && npm run dev
   ```
6. Acessar: frontend em http://localhost:5173 | backend em http://localhost:5203

---

_Última atualização: 13 de março de 2026_
