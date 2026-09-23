from pathlib import PurePosixPath

from django.conf import settings
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError

from radiografias.models import CasoClinico


EXTENSOES_DE_IMAGEM = {'.jpg', '.jpeg', '.png', '.webp'}


class Command(BaseCommand):
    help = 'Importa imagens institucionais do prefixo configurado no Scaleway.'

    def handle(self, *args, **options):
        prefixo = settings.SCALEWAY_BIBLIOTECA_PUBLICA_PREFIX.strip('/')

        if not prefixo:
            raise CommandError(
                'Defina SCALEWAY_BIBLIOTECA_PUBLICA_PREFIX no ambiente.'
            )

        criados = self.importar_diretorio(f'{prefixo}/')

        self.stdout.write(
            self.style.SUCCESS(
                f'{criados} imagens importadas para a biblioteca compartilhada.'
            )
        )

    def importar_diretorio(self, diretorio):
        try:
            diretorios, arquivos = default_storage.listdir(diretorio)
        except FileNotFoundError as erro:
            raise CommandError(
                f'Pasta não encontrada no bucket: {diretorio}'
            ) from erro

        criados = 0

        for arquivo in arquivos:
            nome_arquivo = f'{diretorio}{arquivo}'
            caminho = PurePosixPath(nome_arquivo)

            if caminho.suffix.lower() not in EXTENSOES_DE_IMAGEM:
                continue

            caso, criado = CasoClinico.objects.get_or_create(
                imagem=nome_arquivo,
                defaults={
                    'titulo': caminho.stem.replace('_', ' ').replace('-', ' ').title(),
                    'descricao': 'Radiografia institucional para treinamento.',
                    'regiao_anatomica': 'geral',
                    'visibilidade': CasoClinico.Visibilidade.COMPARTILHADA,
                    'professor': None,
                },
            )

            # Objetos existentes nesse prefixo passam a ser institucionais.
            if not criado and caso.visibilidade != CasoClinico.Visibilidade.COMPARTILHADA:
                caso.visibilidade = CasoClinico.Visibilidade.COMPARTILHADA
                caso.professor = None
                caso.save(update_fields=['visibilidade', 'professor'])

            criados += int(criado)

        for subdiretorio in diretorios:
            criados += self.importar_diretorio(
                f'{diretorio}{subdiretorio}/'
            )

        return criados