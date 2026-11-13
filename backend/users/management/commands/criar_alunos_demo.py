import os

from django.core.management.base import BaseCommand
from django.db import transaction

from ranking.models import PerfilGamificacao
from turmas.models import Turma
from users.models import Usuario
from users.services.termos_service import aceite_pendente, registrar_aceite

CODIGO_PADRAO = '42FCVV'
SENHA_PADRAO = 'RadioDent#2026'
DOMINIO_PADRAO = 'example.com'

ALUNOS = [
    ('Ana Beatriz Souza', 120),
    ('Bruno Carvalho', 260),
    ('Camila Ferreira', 410),
    ('Daniel Oliveira', 580),
    ('Eduarda Lima', 730),
    ('Felipe Santos', 890),
    ('Gabriela Almeida', 1050),
    ('Henrique Costa', 1240),
    ('Isabela Rocha', 1430),
    ('João Pedro Martins', 1670),
    ('Larissa Ribeiro', 1890),
    ('Lucas Mendes', 2050),
    ('Mariana Barbosa', 2280),
    ('Matheus Araújo', 2510),
    ('Natália Gomes', 2790),
    ('Pedro Henrique Dias', 3020),
    ('Rafaela Castro', 3310),
    ('Renato Nunes', 3580),
    ('Sofia Cardoso', 3840),
    ('Thiago Moreira', 4120),
    ('Vanessa Teixeira', 4380),
    ('Vinícius Freitas', 4670),
    ('Yasmin Correia', 4930),
    ('Beatriz Fernandes', 5180),
    ('Caio Monteiro', 5460),
    ('Débora Vieira', 5720),
    ('Enzo Pereira', 6010),
    ('Fernanda Lopes', 6280),
    ('Gustavo Ramos', 6540),
    ('Helena Duarte', 6810),
]


class Command(BaseCommand):
    help = 'Cria alunos de demonstracao na turma informada, com XP variado.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--codigo',
            default=os.getenv('TURMA_DEMO_CODIGO', CODIGO_PADRAO),
        )
        parser.add_argument(
            '--senha',
            default=os.getenv('ALUNOS_DEMO_SENHA', SENHA_PADRAO),
        )
        parser.add_argument(
            '--dominio',
            default=os.getenv('ALUNOS_DEMO_DOMINIO', DOMINIO_PADRAO),
        )

    @transaction.atomic
    def handle(self, *args, **opcoes):
        codigo = opcoes['codigo'].strip().upper()
        senha = opcoes['senha']
        dominio = opcoes['dominio'].strip().lower()

        try:
            turma = Turma.objects.get(codigo_convite=codigo)
        except Turma.DoesNotExist:
            self.stderr.write(
                self.style.WARNING(
                    f'Turma {codigo} nao encontrada; nenhum aluno foi criado.'
                )
            )
            return

        criados = 0
        atualizados = 0

        for indice, (nome, xp) in enumerate(ALUNOS, start=1):
            email = f'aluno.demo{indice:02d}@{dominio}'
            usuario = Usuario.objects.filter(email=email).first()

            if usuario is None:
                usuario = Usuario.objects.create_user(
                    email=email,
                    password=senha,
                    nome=nome,
                    perfil='aluno',
                )
                criados += 1
            else:
                usuario.nome = nome
                usuario.perfil = 'aluno'
                usuario.save(update_fields=['nome', 'perfil'])
                atualizados += 1

            if aceite_pendente(usuario):
                registrar_aceite(usuario)

            PerfilGamificacao.objects.update_or_create(
                aluno=usuario,
                defaults={'xp_total': xp},
            )

            turma.alunos.add(usuario)

        self.stdout.write(
            self.style.SUCCESS(
                f'Turma {codigo}: {criados} criados, '
                f'{atualizados} atualizados, {len(ALUNOS)} no total.'
            )
        )
