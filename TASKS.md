# Tasks — Literacats

Lista de tarefas pendentes para o desenvolvimento do app.

---

## Em Progresso

### 🔄 Integração DynamoDB
- [x] Criar interface `IDataService`
- [x] Refatorar `DataService` → `InMemoryDataService`
- [x] Criar `DynamoDbService` com single-table design
- [x] Atualizar endpoints para async
- [x] Criar scripts de criação de tabela e seed
- [ ] **PRÓXIMO:** Instalar Docker Desktop
- [ ] Subir DynamoDB Local (`docker run -p 8000:8000 amazon/dynamodb-local`)
- [ ] Criar tabela com script `backend/scripts/create-table.sh`
- [ ] Popular dados com script `backend/scripts/seed-data.sh`
- [ ] Testar com `UseDynamoDB=true` no `appsettings.Development.json`

---

## Próximas Tasks

### Autenticação e Perfil

- [ ] **Implementar login com AWS Cognito**
  - Criar User Pool no Cognito
  - Integrar `amazon-cognito-identity-js` no frontend
  - Criar contexto de autenticação (`AuthContext`)
  - Proteger rotas que precisam de login
  - Tela de login/cadastro funcional

- [ ] **Lista pessoal de livros por membra**
  - Após login, membra pode marcar livros como:
    - **Lendo** — livro atual
    - **Lido** — já terminou
    - **Quero ler** — na fila
  - Salvar no DynamoDB
  - Sincronizar com página de perfil público (`/membra/:id`)
  - Mostrar status do livro no card da biblioteca

- [ ] **Avaliação de livros**
  - Permitir avaliar livros com estrelas (1-5)
  - Campo opcional de resenha
  - Exibir avaliações na página do livro (`/livro/:id`)
  - Calcular média de avaliações do clube

---

### Frontend

- [ ] **Responsividade mobile**
  - Testar e ajustar todas as páginas em telas pequenas
  - Menu hamburguer na navbar mobile
  - Cards adaptáveis

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

- [ ] **Perfil**
  - Editar foto de perfil
  - Ajustar aba de configuração
  - Cadastro de livros favoritos

- [ ] **Membras**
  - Permitir ver meta literaria no perfil das membra quando clica

- [ ] **Biblioteca**
  - Permitir favoritar um livro vinculando ao perfil conectado
  - Adicionar um destaque no livro do mes, vinculando ao livro sorteado ou permitir que alguem com perfil de adm adicione essa tag de livro do mes

---

### Backend

- [ ] **Endpoint de recomendação IA**
  - `POST /recomendacoes` — enviar contexto para Claude
  - Montar prompt com histórico do clube
  - Retornar sugestão formatada

- [ ] **Ajuste de membras e livros mockados para valores reais**

---

### Infra e Deploy

- [ ] **Configurar AWS SAM ou CDK**
  - Template para Lambda + DynamoDB + Cognito
  - Variáveis de ambiente

- [ ] **CI/CD com GitHub Actions**
  - Build e deploy automático do frontend (S3)
  - Build e deploy do backend (Lambda)

- [ ] **Domínio e HTTPS**
  - Configurar domínio customizado
  - Certificado SSL no CloudFront

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

---

## Ideias Futuras

- [ ] Notificações (lembrete do encontro, novo livro sorteado)
- [ ] Chat/comentários por livro
- [ ] Integração com Goodreads
- [ ] App mobile (React Native ou PWA)
- [ ] Gamificação (mais badges, ranking mensal)
- [ ] Modo escuro

---

## Como Continuar Amanhã

1. **Instalar Docker Desktop** (https://docker.com/products/docker-desktop)
2. Reiniciar PC se necessário
3. Rodar DynamoDB Local:
   ```bash
   docker run -p 8000:8000 amazon/dynamodb-local
   ```
4. Criar tabela:
   ```bash
   cd backend/scripts && bash create-table.sh
   ```
5. Popular dados:
   ```bash
   bash seed-data.sh
   ```
6. Alterar `appsettings.Development.json`:
   ```json
   "UseDynamoDB": true
   ```
7. Rodar backend:
   ```bash
   cd backend/Literacats.Api && dotnet run
   ```
8. Testar no frontend (http://localhost:5174)

---

_Última atualização: Março 2026_
