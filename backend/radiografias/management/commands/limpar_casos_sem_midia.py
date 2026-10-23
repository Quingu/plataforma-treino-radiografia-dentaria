from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError

from radiografias.models import CasoClinico
from radiografias.models.caso_clinico import TipoMidia


class Command(BaseCommand):
    help = 'Remove casos clínicos cujo arquivo de mídia não existe mais no storage.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Lista os casos que seriam removidos sem apagar nada.',
        )
        parser.add_argument(
            '--forcar',
            action='store_true',
            help='Remove também casos vinculados a tarefas (remove as tarefas em cascata).',
        )

    def handle(self, *args, **options):
        try:
            cliente = default_storage.connection.meta.client
            bucket = default_storage.bucket_name
        except AttributeError as erro:
            raise CommandError(
                'O storage padrão não expõe um cliente S3 compatível.'
            ) from erro

        prefixos = set()
        for caso in CasoClinico.objects.all().only(
            'imagem', 'modelo_3d', 'tipo_midia'
        ):
            nome = self.nome_midia(caso)
            if self.arquivo_local(nome):
                prefixos.add(f'{nome.split("/", 1)[0]}/')

        chaves = set()
        paginador = cliente.get_paginator('list_objects_v2')
        for prefixo in sorted(prefixos):
            for pagina in paginador.paginate(Bucket=bucket, Prefix=prefixo):
                chaves.update(
                    objeto['Key'] for objeto in pagina.get('Contents', [])
                )

        if prefixos and not chaves:
            raise CommandError(
                'Nenhum objeto encontrado no bucket; limpeza cancelada para evitar '
                'remoção indevida de todos os casos.'
            )

        faltando = []
        com_tarefas = []
        for caso in CasoClinico.objects.all():
            nome = self.nome_midia(caso)
            if not self.arquivo_local(nome) or nome in chaves:
                continue
            if caso.tarefas.exists() and not options['forcar']:
                com_tarefas.append(caso)
                continue
            faltando.append((caso, nome))

        for caso, nome in faltando:
            self.stdout.write(f'{caso.id} | {caso.titulo} | {nome}')
            if not options['dry_run']:
                caso.delete()

        for caso in com_tarefas:
            self.stdout.write(
                self.style.WARNING(
                    f'Ignorado (possui tarefas): {caso.id} | {caso.titulo}'
                )
            )

        if options['dry_run']:
            self.stdout.write(
                self.style.WARNING(
                    f'Simulação: {len(faltando)} casos seriam removidos.'
                )
            )
            return

        self.stdout.write(
            self.style.SUCCESS(f'{len(faltando)} casos removidos.')
        )

    def nome_midia(self, caso):
        if caso.tipo_midia == TipoMidia.MODELO_3D:
            return caso.modelo_3d.name if caso.modelo_3d else ''
        return caso.imagem.name if caso.imagem else ''

    def arquivo_local(self, nome):
        return bool(nome) and not nome.startswith(('http://', 'https://'))
