#!/usr/bin/env bash
# Interrompe o script imediatamente se houver algum erro
set -o errexit

echo "Instalando dependências..."
pip install -r requirements.txt

echo "Coletando arquivos estáticos..."
python manage.py collectstatic --no-input

echo "Aplicando migrações no banco de dados (Supabase)..."
python manage.py migrate