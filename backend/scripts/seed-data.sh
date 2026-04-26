#!/bin/bash

# Script para popular dados iniciais no DynamoDB Local
# Requer AWS CLI instalado e DynamoDB Local rodando na porta 8000

ENDPOINT="--endpoint-url http://localhost:8000"
TABLE="literacats"

echo "Inserindo livros..."

# Janeiro 2026
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "LIVRO#1"}, "SK": {"S": "LIVRO#1"},
    "GSI1PK": {"S": "TIPO#LIVRO"}, "GSI1SK": {"S": "1"},
    "Id": {"S": "1"}, "Titulo": {"S": "Quicksilver"}, "Autor": {"S": "Callie Hart"},
    "Genero": {"S": "Romantasy"}, "Paginas": {"N": "624"},
    "Capa": {"S": "https://covers.openlibrary.org/b/id/15154838-L.jpg"},
    "DataCadastro": {"S": "2026-01-01T00:00:00Z"}
}'

# Fevereiro 2026
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "LIVRO#2"}, "SK": {"S": "LIVRO#2"},
    "GSI1PK": {"S": "TIPO#LIVRO"}, "GSI1SK": {"S": "2"},
    "Id": {"S": "2"}, "Titulo": {"S": "Nem Todo Outono É Igual"}, "Autor": {"S": "Misty Wilson"},
    "Genero": {"S": "Ficção Brasileira"}, "Paginas": {"N": "224"}, "DataCadastro": {"S": "2026-02-01T00:00:00Z"}
}'

# Março 2026
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "LIVRO#3"}, "SK": {"S": "LIVRO#3"},
    "GSI1PK": {"S": "TIPO#LIVRO"}, "GSI1SK": {"S": "3"},
    "Id": {"S": "3"}, "Titulo": {"S": "Como Arruinar Um Casamento"}, "Autor": {"S": "Alison Espach"},
    "Genero": {"S": "Ficção Estrangeira"}, "Paginas": {"N": "384"},
    "Capa": {"S": "https://covers.openlibrary.org/b/id/15127690-L.jpg"},
    "DataCadastro": {"S": "2026-03-01T00:00:00Z"}
}'

# Abril 2026 (livro do mês atual)
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "LIVRO#4"}, "SK": {"S": "LIVRO#4"},
    "GSI1PK": {"S": "TIPO#LIVRO"}, "GSI1SK": {"S": "4"},
    "Id": {"S": "4"}, "Titulo": {"S": "Suíte em Tóquio"}, "Autor": {"S": "Giovana Madalosso"},
    "Genero": {"S": "Ficção Brasileira"}, "Paginas": {"N": "200"},
    "Capa": {"S": "https://covers.openlibrary.org/b/id/10839541-L.jpg"},
    "DataCadastro": {"S": "2026-04-01T00:00:00Z"}
}'

echo "Inserindo membras..."

# Camila
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#1"}, "SK": {"S": "MEMBRA#1"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "1"},
    "Id": {"S": "1"}, "Nome": {"S": "Camila"}, "Apelido": {"S": "camis"},
    "Bio": {"S": "Adoro correr, cozinhar, ler e às vezes lembro que também sou programadora"}, "MetaLeituraAnual": {"N": "12"}, "MembraDesde": {"S": "2026-01-01T00:00:00Z"}
}'

# Sara, Gio, Larissa, Kamilla — sem bio/meta. Elas preenchem ao logar.
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#2"}, "SK": {"S": "MEMBRA#2"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "2"},
    "Id": {"S": "2"}, "Nome": {"S": "Sara"}, "Apelido": {"S": "sara"},
    "MetaLeituraAnual": {"N": "12"}, "MembraDesde": {"S": "2026-01-01T00:00:00Z"}
}'

aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#3"}, "SK": {"S": "MEMBRA#3"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "3"},
    "Id": {"S": "3"}, "Nome": {"S": "Gio"}, "Apelido": {"S": "gio"},
    "MetaLeituraAnual": {"N": "12"}, "MembraDesde": {"S": "2026-01-01T00:00:00Z"}
}'

aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#4"}, "SK": {"S": "MEMBRA#4"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "4"},
    "Id": {"S": "4"}, "Nome": {"S": "Larissa"}, "Apelido": {"S": "lari"},
    "MetaLeituraAnual": {"N": "12"}, "MembraDesde": {"S": "2026-01-01T00:00:00Z"}
}'

aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#5"}, "SK": {"S": "MEMBRA#5"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "5"},
    "Id": {"S": "5"}, "Nome": {"S": "Kamilla"}, "Apelido": {"S": "Kamilla"},
    "MetaLeituraAnual": {"N": "12"}, "MembraDesde": {"S": "2026-01-01T00:00:00Z"}
}'

echo "Inserindo relação membra-livro (Camila leu todos os do clube)..."

# Camila leu Quicksilver
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#1"}, "SK": {"S": "LIVRO#1"},
    "MembraId": {"S": "1"}, "LivroId": {"S": "1"},
    "Status": {"S": "Lido"}, "DataLeitura": {"S": "2026-01-31T00:00:00Z"}
}'

# Camila leu Nem Todo Outono É Igual
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#1"}, "SK": {"S": "LIVRO#2"},
    "MembraId": {"S": "1"}, "LivroId": {"S": "2"},
    "Status": {"S": "Lido"}, "DataLeitura": {"S": "2026-02-28T00:00:00Z"}
}'

# Camila leu Como Arruinar Um Casamento
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#1"}, "SK": {"S": "LIVRO#3"},
    "MembraId": {"S": "1"}, "LivroId": {"S": "3"},
    "Status": {"S": "Lido"}, "DataLeitura": {"S": "2026-03-31T00:00:00Z"}
}'

# Camila está lendo Suíte em Tóquio (livro do mês atual)
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#1"}, "SK": {"S": "LIVRO#4"},
    "MembraId": {"S": "1"}, "LivroId": {"S": "4"},
    "Status": {"S": "Lendo"}
}'

echo "Inserindo histórico de sorteios..."

# Janeiro 2026
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "SORTEIO#2026#01"}, "SK": {"S": "SORTEIO"},
    "GSI1PK": {"S": "TIPO#SORTEIO"}, "GSI1SK": {"S": "2026#01"},
    "Id": {"S": "sorteio-jan-2026"}, "Mes": {"N": "1"}, "Ano": {"N": "2026"},
    "LivroSorteadoTitulo": {"S": "Quicksilver"}, "DataSorteio": {"S": "2026-01-01T00:00:00Z"}
}'

# Fevereiro 2026
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "SORTEIO#2026#02"}, "SK": {"S": "SORTEIO"},
    "GSI1PK": {"S": "TIPO#SORTEIO"}, "GSI1SK": {"S": "2026#02"},
    "Id": {"S": "sorteio-fev-2026"}, "Mes": {"N": "2"}, "Ano": {"N": "2026"},
    "LivroSorteadoTitulo": {"S": "Nem Todo Outono É Igual"}, "DataSorteio": {"S": "2026-02-01T00:00:00Z"}
}'

# Março 2026
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "SORTEIO#2026#03"}, "SK": {"S": "SORTEIO"},
    "GSI1PK": {"S": "TIPO#SORTEIO"}, "GSI1SK": {"S": "2026#03"},
    "Id": {"S": "sorteio-mar-2026"}, "Mes": {"N": "3"}, "Ano": {"N": "2026"},
    "LivroSorteadoTitulo": {"S": "Como Arruinar Um Casamento"}, "DataSorteio": {"S": "2026-03-01T00:00:00Z"}
}'

# Abril 2026 (mês atual)
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "SORTEIO#2026#04"}, "SK": {"S": "SORTEIO"},
    "GSI1PK": {"S": "TIPO#SORTEIO"}, "GSI1SK": {"S": "2026#04"},
    "Id": {"S": "sorteio-abr-2026"}, "Mes": {"N": "4"}, "Ano": {"N": "2026"},
    "LivroSorteadoTitulo": {"S": "Suíte em Tóquio"}, "DataSorteio": {"S": "2026-04-01T00:00:00Z"}
}'

echo "Dados inseridos com sucesso!"
