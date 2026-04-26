#!/bin/bash

# Cria a tabela `literacats` no DynamoDB AWS real (sem --endpoint-url).
# Usa PAY_PER_REQUEST: você só paga pelo que usa, e o free tier cobre 25GB
# + 200M de requests/mês — pra um clube de 30 mulheres é gratuito de fato.
#
# Requer: AWS CLI configurado (`aws configure`) com permissão de DynamoDB.

set -e

# Desliga o pager interativo do AWS CLI v2 (senão ele abre o `less` e trava o terminal)
export AWS_PAGER=""

TABLE="literacats"
REGION="${AWS_REGION:-us-east-1}"

echo "🐱 Criando tabela '$TABLE' em $REGION..."

aws dynamodb create-table \
    --table-name "$TABLE" \
    --region "$REGION" \
    --billing-mode PAY_PER_REQUEST \
    --no-cli-pager \
    --attribute-definitions \
        AttributeName=PK,AttributeType=S \
        AttributeName=SK,AttributeType=S \
        AttributeName=GSI1PK,AttributeType=S \
        AttributeName=GSI1SK,AttributeType=S \
    --key-schema \
        AttributeName=PK,KeyType=HASH \
        AttributeName=SK,KeyType=RANGE \
    --global-secondary-indexes \
        '[{
            "IndexName": "GSI1",
            "KeySchema": [
                {"AttributeName": "GSI1PK", "KeyType": "HASH"},
                {"AttributeName": "GSI1SK", "KeyType": "RANGE"}
            ],
            "Projection": {"ProjectionType": "ALL"}
        }]'

echo ""
echo "⏳ Esperando tabela ficar ATIVA..."
aws dynamodb wait table-exists --table-name "$TABLE" --region "$REGION"
echo "✅ Tabela '$TABLE' criada com sucesso!"
