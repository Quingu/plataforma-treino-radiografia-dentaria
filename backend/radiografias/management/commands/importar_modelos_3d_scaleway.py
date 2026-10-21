from pathlib import PurePosixPath

from django.conf import settings
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError

from radiografias.models import CasoClinico
from radiografias.models.caso_clinico import TipoMidia
from radiografias.services.modelo_3d_storage_service import (
    MAGIC_GLB,
    extensao_modelo_3d_valida,
    limite_bytes,
)


class Command(BaseCommand):
    help = 'Importa modelos .glb institucionais do prefixo configurado no Scaleway.'

    def handle(self, *args, **options):
        prefixo = settings.SCALEWAY_MODELOS_3D_PREFIX.strip('/')

        if not prefixo:
            raise CommandError(
                'Defina SCALEWAY_MODELOS_3D_PREFIX no ambiente.'
            )

        criados = self.importar_diretorio(f'{prefixo}/')

        self.stdout.write(
            self.style.SUCCESS(
                f'{criados} modelos 3D importados para a biblioteca compartilhada.'
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

            if not extensao_modelo_3d_valida(caminho.suffix):
                continue

            if not self.objeto_glb_valido(nome_arquivo):
                continue

            caso, criado = CasoClinico.objects.get_or_create(
                modelo_3d=nome_arquivo,
                defaults={
                    'titulo': caminho.stem.replace('_', ' ').replace('-', ' ').title(),
                    'descricao': 'Modelo 3D institucional para treinamento.',
                    'regiao_anatomica': 'geral',
                    'tipo_midia': TipoMidia.MODELO_3D,
                    'imagem': '',
                    'visibilidade': CasoClinico.Visibilidade.COMPARTILHADA,
                    'professor': None,
                },
            )

            # Objetos existentes nesse prefixo passam a ser institucionais e 3D.
            campos_atualizados = []
            if not criado:
                if caso.tipo_midia != TipoMidia.MODELO_3D:
                    caso.tipo_midia = TipoMidia.MODELO_3D
                    campos_atualizados.append('tipo_midia')
                if caso.visibilidade != CasoClinico.Visibilidade.COMPARTILHADA:
                    caso.visibilidade = CasoClinico.Visibilidade.COMPARTILHADA
                    campos_atualizados.append('visibilidade')
                if caso.professor_id is not None:
                    caso.professor = None
                    campos_atualizados.append('professor')
                if caso.imagem:
                    caso.imagem = ''
                    campos_atualizados.append('imagem')
                if campos_atualizados:
                    caso.save(update_fields=campos_atualizados)

            criados += int(criado)

        for subdiretorio in diretorios:
            criados += self.importar_diretorio(
                f'{diretorio}{subdiretorio}/'
            )

        return criados

    def objeto_glb_valido(self, nome_arquivo):
        try:
            tamanho = default_storage.size(nome_arquivo)
        except Exception:
            self.stdout.write(
                self.style.WARNING(f'Não foi possível ler o tamanho de {nome_arquivo}.')
            )
            return False

        if tamanho > limite_bytes():
            self.stdout.write(
                self.style.WARNING(f'Modelo ignorado por exceder o limite: {nome_arquivo}')
            )
            return False

        try:
            with default_storage.open(nome_arquivo, 'rb') as arquivo:
                cabecalho = arquivo.read(len(MAGIC_GLB))
        except Exception:
            self.stdout.write(
                self.style.WARNING(f'Não foi possível validar {nome_arquivo}.')
            )
            return False

        if cabecalho != MAGIC_GLB:
            self.stdout.write(
                self.style.WARNING(f'Arquivo ignorado por não ser um GLB válido: {nome_arquivo}')
            )
            return False

        return True
