import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Cria uma conta inicial de suporte para o Django Admin.'

    def handle(self, *args, **options):
        email = os.getenv('BOOTSTRAP_ADMIN_EMAIL')
        senha = os.getenv('BOOTSTRAP_ADMIN_PASSWORD')
        nome = os.getenv('BOOTSTRAP_ADMIN_NAME', 'Suporte Técnico')

        
        if not email or not senha:
            self.stdout.write(
                'Conta administrativa inicial não configurada; etapa ignorada.'
            )
            return

        usuario_modelo = get_user_model()

        if usuario_modelo.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING('A conta administrativa já existe; nada foi alterado.')
            )
            return

        usuario = usuario_modelo(
            email=email,
            nome=nome,
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        usuario.set_password(senha)
        usuario.save()

        self.stdout.write(
            self.style.SUCCESS(f'Conta administrativa criada: {email}')
        )