import os

from django.core.management.base import BaseCommand

from users.models import Usuario


class Command(BaseCommand):
    """
    Cria ou atualiza um superusuario do Django admin.

    Usado no deploy do Render, onde nao existe Shell disponivel no plano
    gratuito. Le as credenciais das variaveis de ambiente e pode rodar
    quantas vezes for necessario sem duplicar o usuario.
    """

    help = 'Cria ou atualiza um superusuario a partir de variaveis de ambiente.'

    def handle(self, *args, **opcoes):
        email = os.getenv('DJANGO_SUPERUSER_EMAIL', '').strip().lower()
        senha = os.getenv('DJANGO_SUPERUSER_PASSWORD', '')
        nome = os.getenv('DJANGO_SUPERUSER_NOME', 'Administrador').strip()

        if not email or not senha:
            self.stdout.write(
                'DJANGO_SUPERUSER_EMAIL/PASSWORD nao definidos; '
                'nenhum superusuario foi alterado.'
            )
            return

        usuario = Usuario.objects.filter(email=email).first()
        criado = usuario is None

        if criado:
            usuario = Usuario(email=email)

        usuario.nome = nome or usuario.nome or 'Administrador'
        usuario.perfil = 'professor'
        usuario.is_staff = True
        usuario.is_superuser = True
        usuario.set_password(senha)
        usuario.save()

        acao = 'criado' if criado else 'atualizado'
        self.stdout.write(
            self.style.SUCCESS(f'Superusuario {acao}: {email}')
        )
