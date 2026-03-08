#!/bin/bash

# Script para criar tabela no DynamoDB Local
# Requer AWS CLI instalado e DynamoDB Local rodando na porta 8000

aws dynamodb create-table \
    --table-name literacats \
    --attribute-definitions \
        AttributeName=PK,AttributeType=S \
        AttributeName=SK,AttributeType=S \
        AttributeName=GSI1PK,AttributeType=S \
        AttributeName=GSI1SK,AttributeType=S \
    --key-schema \
        AttributeName=PK,KeyType=HASH \
        AttributeName=SK,KeyType=RANGE \
    --global-secondary-indexes \
        "[{
            \"IndexName\": \"GSI1\",
            \"KeySchema\": [
                {\"AttributeName\": \"GSI1PK\", \"KeyType\": \"HASH\"},
                {\"AttributeName\": \"GSI1SK\", \"KeyType\": \"RANGE\"}
            ],
            \"Projection\": {\"ProjectionType\": \"ALL\"},
            \"ProvisionedThroughput\": {
                \"ReadCapacityUnits\": 5,
                \"WriteCapacityUnits\": 5
            }
        }]" \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --endpoint-url http://localhost:8000

echo "Tabela 'literacats' criada com sucesso!"
