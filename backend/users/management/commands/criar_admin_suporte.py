import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = (
        'Cria ou atualiza, uma única vez, a conta de suporte '
        'para acesso ao Django Admin.'
    )

    def handle(self, *args, **options):
        email = os.getenv('BOOTSTRAP_ADMIN_EMAIL', '').strip().lower()
        senha = os.getenv('BOOTSTRAP_ADMIN_PASSWORD')
        nome = os.getenv('BOOTSTRAP_ADMIN_NAME', 'Suporte Técnico').strip()

        # O comando não faz nada se as credenciais temporárias
        # não estiverem configuradas no ambiente do Render.
        if not email or not senha:
            self.stdout.write(
                self.style.WARNING(
                    'Conta administrativa não configurada; etapa ignorada.'
                )
            )
            return

        usuario_modelo = get_user_model()

        usuario, criado = usuario_modelo.objects.get_or_create(
            email=email,
            defaults={
                'nome': nome,
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            },
        )

        # Permite corrigir uma conta que já existia como aluno/professor,
        # elevando-a temporariamente para acesso administrativo.
        usuario.nome = nome
        usuario.is_staff = True
        usuario.is_superuser = True
        usuario.is_active = True
        usuario.set_password(senha)
        usuario.save()

        acao = 'criada' if criado else 'atualizada'

        self.stdout.write(
            self.style.SUCCESS(
                f'Conta administrativa {acao} com sucesso: {email}'
            )
        )