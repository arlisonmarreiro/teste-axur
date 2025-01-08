#!/bin/bash

# Caminho para os arquivos
ENV_EXAMPLE=".env.example"
ENV_FILE=".env"

# Verifica se o arquivo .env já existe
if [ -f "$ENV_FILE" ]; then
    echo "O arquivo $ENV_FILE já existe. Nenhuma ação necessária."
else
    # Verifica se o arquivo .env.example existe
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        echo "Arquivo $ENV_FILE criado a partir do $ENV_EXAMPLE."
    else
        echo "Erro: Arquivo $ENV_EXAMPLE não encontrado!"
        exit 1
    fi
fi

# Instala as dependências do projeto
echo "Instalando dependências com npm..."
npm install

echo "Setup concluído!"

# Executa a aplicação
echo "Iniciando a aplicação..."
node src/server.js
