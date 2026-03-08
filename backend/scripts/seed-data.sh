#!/bin/bash

# Script para popular dados iniciais no DynamoDB Local
# Requer AWS CLI instalado e DynamoDB Local rodando na porta 8000

ENDPOINT="--endpoint-url http://localhost:8000"
TABLE="literacats"

echo "Inserindo livros..."

# Livros
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "LIVRO#1"}, "SK": {"S": "LIVRO#1"},
    "GSI1PK": {"S": "TIPO#LIVRO"}, "GSI1SK": {"S": "1"},
    "Id": {"S": "1"}, "Titulo": {"S": "Torto Arado"}, "Autor": {"S": "Itamar Vieira Junior"},
    "Genero": {"S": "Ficção Brasileira"}, "Paginas": {"N": "264"}, "DataCadastro": {"S": "2024-01-01T00:00:00Z"}
}'

aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "LIVRO#2"}, "SK": {"S": "LIVRO#2"},
    "GSI1PK": {"S": "TIPO#LIVRO"}, "GSI1SK": {"S": "2"},
    "Id": {"S": "2"}, "Titulo": {"S": "A Vegetariana"}, "Autor": {"S": "Han Kang"},
    "Genero": {"S": "Ficção"}, "Paginas": {"N": "160"}, "DataCadastro": {"S": "2024-01-01T00:00:00Z"}
}'

aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "LIVRO#3"}, "SK": {"S": "LIVRO#3"},
    "GSI1PK": {"S": "TIPO#LIVRO"}, "GSI1SK": {"S": "3"},
    "Id": {"S": "3"}, "Titulo": {"S": "Quarto de Despejo"}, "Autor": {"S": "Carolina Maria de Jesus"},
    "Genero": {"S": "Não-ficção"}, "Paginas": {"N": "200"}, "DataCadastro": {"S": "2024-01-01T00:00:00Z"}
}'

aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "LIVRO#4"}, "SK": {"S": "LIVRO#4"},
    "GSI1PK": {"S": "TIPO#LIVRO"}, "GSI1SK": {"S": "4"},
    "Id": {"S": "4"}, "Titulo": {"S": "Amora"}, "Autor": {"S": "Natalia Borges Polesso"},
    "Genero": {"S": "Contos"}, "Paginas": {"N": "200"}, "DataCadastro": {"S": "2024-01-01T00:00:00Z"}
}'

aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "LIVRO#5"}, "SK": {"S": "LIVRO#5"},
    "GSI1PK": {"S": "TIPO#LIVRO"}, "GSI1SK": {"S": "5"},
    "Id": {"S": "5"}, "Titulo": {"S": "O Conto da Aia"}, "Autor": {"S": "Margaret Atwood"},
    "Genero": {"S": "Distopia"}, "Paginas": {"N": "368"}, "DataCadastro": {"S": "2024-01-01T00:00:00Z"}
}'

aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "LIVRO#6"}, "SK": {"S": "LIVRO#6"},
    "GSI1PK": {"S": "TIPO#LIVRO"}, "GSI1SK": {"S": "6"},
    "Id": {"S": "6"}, "Titulo": {"S": "Hibisco Roxo"}, "Autor": {"S": "Chimamanda Ngozi Adichie"},
    "Genero": {"S": "Ficção"}, "Paginas": {"N": "328"}, "DataCadastro": {"S": "2024-01-01T00:00:00Z"}
}'

echo "Inserindo membras..."

# Membras
aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#1"}, "SK": {"S": "MEMBRA#1"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "1"},
    "Id": {"S": "1"}, "Nome": {"S": "Maria Silva"}, "Apelido": {"S": "mari"},
    "Bio": {"S": "Apaixonada por ficção brasileira e café forte"}, "MetaLeituraAnual": {"N": "24"}, "MembraDesde": {"S": "2023-03-01T00:00:00Z"}
}'

aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#2"}, "SK": {"S": "MEMBRA#2"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "2"},
    "Id": {"S": "2"}, "Nome": {"S": "Ana Carolina"}, "Apelido": {"S": "anacarol"},
    "Bio": {"S": "Devoradora de romances e fantasias"}, "MetaLeituraAnual": {"N": "36"}, "MembraDesde": {"S": "2023-01-01T00:00:00Z"}
}'

aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#3"}, "SK": {"S": "MEMBRA#3"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "3"},
    "Id": {"S": "3"}, "Nome": {"S": "Julia Santos"}, "Apelido": {"S": "juju"},
    "Bio": {"S": "Não-ficção é meu combustível"}, "MetaLeituraAnual": {"N": "20"}, "MembraDesde": {"S": "2023-06-01T00:00:00Z"}
}'

aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#4"}, "SK": {"S": "MEMBRA#4"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "4"},
    "Id": {"S": "4"}, "Nome": {"S": "Beatriz Oliveira"}, "Apelido": {"S": "bia"},
    "Bio": {"S": "Poesia e contos curtos sempre"}, "MetaLeituraAnual": {"N": "18"}, "MembraDesde": {"S": "2023-08-01T00:00:00Z"}
}'

aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#5"}, "SK": {"S": "MEMBRA#5"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "5"},
    "Id": {"S": "5"}, "Nome": {"S": "Camila Rocha"}, "Apelido": {"S": "cami"},
    "Bio": {"S": "Distopias e ficção científica"}, "MetaLeituraAnual": {"N": "30"}, "MembraDesde": {"S": "2023-02-01T00:00:00Z"}
}'

aws dynamodb put-item $ENDPOINT --table-name $TABLE --item '{
    "PK": {"S": "MEMBRA#6"}, "SK": {"S": "MEMBRA#6"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "6"},
    "Id": {"S": "6"}, "Nome": {"S": "Fernanda Lima"}, "Apelido": {"S": "fe"},
    "Bio": {"S": "Terror e suspense pra ler de noite"}, "MetaLeituraAnual": {"N": "24"}, "MembraDesde": {"S": "2023-04-01T00:00:00Z"}
}'

echo "Dados inseridos com sucesso!"
