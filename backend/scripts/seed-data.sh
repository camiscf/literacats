#!/bin/bash

# Script para popular dados iniciais no DynamoDB Local
# Requer AWS CLI instalado e DynamoDB Local rodando na porta 8000

ENDPOINT="--endpoint-url http://localhost:8000"
TABLE="literacats"

echo "Inserindo livros..."

# Livro do clube - Fevereiro 2026
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "LIVRO#1"}, "SK": {"S": "LIVRO#1"},
    "GSI1PK": {"S": "TIPO#LIVRO"}, "GSI1SK": {"S": "1"},
    "Id": {"S": "1"}, "Titulo": {"S": "Nem Todo Outono É Igual"}, "Autor": {"S": "Carla Madeira"},
    "Genero": {"S": "Ficção Brasileira"}, "Paginas": {"N": "224"}, "DataCadastro": {"S": "2026-02-01T00:00:00Z"}
}'

echo "Inserindo membras..."

# Camila
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#1"}, "SK": {"S": "MEMBRA#1"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "1"},
    "Id": {"S": "1"}, "Nome": {"S": "Camila"}, "Apelido": {"S": "camis"},
    "Bio": {"S": "Adoro correr, cozinhar, ler e às vezes lembro que também sou programadora"}, "MetaLeituraAnual": {"N": "12"}, "MembraDesde": {"S": "2026-02-01T00:00:00Z"}
}'

echo "Inserindo relação membra-livro..."

# Camila leu "Nem Todo Outono É Igual"
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#1"}, "SK": {"S": "LIVRO#1"},
    "MembraId": {"S": "1"}, "LivroId": {"S": "1"},
    "Status": {"S": "Lido"}, "DataLeitura": {"S": "2026-02-28T00:00:00Z"}
}'

echo "Inserindo histórico de sorteio..."

# Sorteio de Fevereiro 2026
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "SORTEIO#2026#02"}, "SK": {"S": "SORTEIO"},
    "GSI1PK": {"S": "TIPO#SORTEIO"}, "GSI1SK": {"S": "2026#02"},
    "Id": {"S": "sorteio-fev-2026"}, "Mes": {"N": "2"}, "Ano": {"N": "2026"},
    "LivroSorteadoTitulo": {"S": "Nem Todo Outono É Igual"}, "DataSorteio": {"S": "2026-02-01T00:00:00Z"}
}'

echo "Dados inseridos com sucesso!"
