#!/bin/bash

# Popula a tabela do DynamoDB AWS real com os 5 livros e 5 membras iniciais.
# Diferente do seed-data.sh, não usa --endpoint-url (vai pra AWS de verdade).
#
# As membras começam SEM PIN — cada uma cria no primeiro acesso.

set -e

# Desliga o pager interativo do AWS CLI v2
export AWS_PAGER=""

TABLE="literacats"
REGION="${AWS_REGION:-us-east-1}"
PUT="aws dynamodb put-item --region $REGION --table-name $TABLE --item"

echo "🐱 Inserindo livros..."

$PUT '{
    "PK": {"S": "LIVRO#1"}, "SK": {"S": "LIVRO#1"},
    "GSI1PK": {"S": "TIPO#LIVRO"}, "GSI1SK": {"S": "1"},
    "Id": {"S": "1"}, "Titulo": {"S": "Quicksilver"}, "Autor": {"S": "Callie Hart"},
    "Genero": {"S": "Romantasy"}, "Paginas": {"N": "624"},
    "Capa": {"S": "https://covers.openlibrary.org/b/id/15154838-L.jpg"},
    "DataCadastro": {"S": "2026-01-01T00:00:00Z"}
}' > /dev/null

$PUT '{
    "PK": {"S": "LIVRO#2"}, "SK": {"S": "LIVRO#2"},
    "GSI1PK": {"S": "TIPO#LIVRO"}, "GSI1SK": {"S": "2"},
    "Id": {"S": "2"}, "Titulo": {"S": "Nem Todo Outono É Igual"}, "Autor": {"S": "Carla Madeira"},
    "Genero": {"S": "Ficção Brasileira"}, "Paginas": {"N": "224"},
    "DataCadastro": {"S": "2026-02-01T00:00:00Z"}
}' > /dev/null

$PUT '{
    "PK": {"S": "LIVRO#3"}, "SK": {"S": "LIVRO#3"},
    "GSI1PK": {"S": "TIPO#LIVRO"}, "GSI1SK": {"S": "3"},
    "Id": {"S": "3"}, "Titulo": {"S": "Como Arruinar Um Casamento"}, "Autor": {"S": "Alison Espach"},
    "Genero": {"S": "Ficção Estrangeira"}, "Paginas": {"N": "384"},
    "Capa": {"S": "https://covers.openlibrary.org/b/id/15127690-L.jpg"},
    "DataCadastro": {"S": "2026-03-01T00:00:00Z"}
}' > /dev/null

$PUT '{
    "PK": {"S": "LIVRO#4"}, "SK": {"S": "LIVRO#4"},
    "GSI1PK": {"S": "TIPO#LIVRO"}, "GSI1SK": {"S": "4"},
    "Id": {"S": "4"}, "Titulo": {"S": "Suíte em Tóquio"}, "Autor": {"S": "Giovana Madalosso"},
    "Genero": {"S": "Ficção Brasileira"}, "Paginas": {"N": "200"},
    "Capa": {"S": "https://covers.openlibrary.org/b/id/10839541-L.jpg"},
    "DataCadastro": {"S": "2026-04-01T00:00:00Z"}
}' > /dev/null

echo "🐱 Inserindo membras..."

$PUT '{
    "PK": {"S": "MEMBRA#1"}, "SK": {"S": "MEMBRA#1"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "1"},
    "Id": {"S": "1"}, "Nome": {"S": "Camila"}, "Apelido": {"S": "camis"},
    "Bio": {"S": "Adoro correr, cozinhar, ler e às vezes lembro que também sou programadora"},
    "MetaLeituraAnual": {"N": "12"}, "MembraDesde": {"S": "2026-01-01T00:00:00Z"}
}' > /dev/null

$PUT '{
    "PK": {"S": "MEMBRA#2"}, "SK": {"S": "MEMBRA#2"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "2"},
    "Id": {"S": "2"}, "Nome": {"S": "Sara"}, "Apelido": {"S": "sara"},
    "MetaLeituraAnual": {"N": "12"}, "MembraDesde": {"S": "2026-01-01T00:00:00Z"}
}' > /dev/null

$PUT '{
    "PK": {"S": "MEMBRA#3"}, "SK": {"S": "MEMBRA#3"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "3"},
    "Id": {"S": "3"}, "Nome": {"S": "Gio"}, "Apelido": {"S": "gio"},
    "MetaLeituraAnual": {"N": "12"}, "MembraDesde": {"S": "2026-01-01T00:00:00Z"}
}' > /dev/null

$PUT '{
    "PK": {"S": "MEMBRA#4"}, "SK": {"S": "MEMBRA#4"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "4"},
    "Id": {"S": "4"}, "Nome": {"S": "Larissa"}, "Apelido": {"S": "lari"},
    "MetaLeituraAnual": {"N": "12"}, "MembraDesde": {"S": "2026-01-01T00:00:00Z"}
}' > /dev/null

$PUT '{
    "PK": {"S": "MEMBRA#5"}, "SK": {"S": "MEMBRA#5"},
    "GSI1PK": {"S": "TIPO#MEMBRA"}, "GSI1SK": {"S": "5"},
    "Id": {"S": "5"}, "Nome": {"S": "Kamilla"}, "Apelido": {"S": "kamilla"},
    "MetaLeituraAnual": {"N": "12"}, "MembraDesde": {"S": "2026-01-01T00:00:00Z"}
}' > /dev/null

echo "✅ Dados inseridos com sucesso!"
