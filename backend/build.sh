#!/usr/bin/env bash
# Interrompe o script imediatamente se houver algum erro
set -o errexit

echo "Instalando dependências..."
pip install -r requirements.txt

echo "Coletando arquivos estáticos..."
python manage.py collectstatic --no-input

echo "Aplicando migrações no banco de dados (Supabase)..."
python manage.py migrate

echo "Aplicando migrações no banco de dados (Supabase)..."
python manage.py migrate

# Cria/atualiza o superusuario do Django admin a partir das variaveis
# DJANGO_SUPERUSER_EMAIL, DJANGO_SUPERUSER_PASSWORD e DJANGO_SUPERUSER_NOME.
# Sem essas variaveis o comando nao faz nada.
echo "Verificando superusuario do admin..."
python manage.py criar_superusuario

echo "Importando modelos 3D do Scaleway..."
python manage.py importar_modelos_3d_scaleway