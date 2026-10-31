"""Troca a chave primária de Turma (bigint serial) por UUID.

Mesmo motivo da migração ``users.0008``: com id sequencial é possível
estimar quantas turmas existem e trocar o número na URL para tentar
acessar a turma de outro professor (IDOR).

Os registros existentes são preservados: no PostgreSQL cada inteiro vira
``md5(valor)::uuid`` também nas colunas que o referenciam; no SQLite
(usado apenas nos testes) o Django recria a tabela.
"""

import uuid

from django.db import migrations, models
from django.db.migrations.operations.base import Operation

TABELAS_ALVO = ('turmas_turma',)


def _converter_postgresql(schema_editor, tabelas_alvo):
    conexao = schema_editor.connection
    tabelas = list(tabelas_alvo)

    def citação(nome):
        return schema_editor.quote_name(nome)

    with conexao.cursor() as cursor:
        cursor.execute(
            """
            SELECT origem.relname,
                   restricao.conname,
                   pg_get_constraintdef(restricao.oid),
                   string_agg(coluna.attname, ',' ORDER BY coluna.attnum)
              FROM pg_constraint restricao
              JOIN pg_class origem ON origem.oid = restricao.conrelid
              JOIN pg_class alvo ON alvo.oid = restricao.confrelid
              JOIN pg_attribute coluna
                ON coluna.attrelid = restricao.conrelid
               AND coluna.attnum = ANY (restricao.conkey)
             WHERE restricao.contype = 'f'
               AND alvo.relname = ANY (%s)
             GROUP BY origem.relname, restricao.conname, restricao.oid
            """,
            [tabelas],
        )
        chaves_estrangeiras = cursor.fetchall()

        cursor.execute(
            """
            SELECT tabela.relname, restricao.conname
              FROM pg_constraint restricao
              JOIN pg_class tabela ON tabela.oid = restricao.conrelid
             WHERE restricao.contype = 'p'
               AND tabela.relname = ANY (%s)
            """,
            [tabelas],
        )
        chaves_primarias = cursor.fetchall()

        for tabela, nome, _definicao, _colunas in chaves_estrangeiras:
            cursor.execute(
                f'ALTER TABLE {citação(tabela)} DROP CONSTRAINT {citação(nome)}'
            )

        for tabela, nome in chaves_primarias:
            cursor.execute(
                f'ALTER TABLE {citação(tabela)} DROP CONSTRAINT {citação(nome)}'
            )

        for tabela, _nome, _definicao, colunas in chaves_estrangeiras:
            for coluna in colunas.split(','):
                cursor.execute(
                    f'ALTER TABLE {citação(tabela)} '
                    f'ALTER COLUMN {citação(coluna)} TYPE uuid '
                    f'USING (md5({citação(coluna)}::text))::uuid'
                )

        for tabela in tabelas:
            cursor.execute(
                f'ALTER TABLE {citação(tabela)} '
                f'ALTER COLUMN id DROP IDENTITY IF EXISTS'
            )
            cursor.execute(
                f'ALTER TABLE {citação(tabela)} '
                f'ALTER COLUMN id DROP DEFAULT'
            )
            cursor.execute(
                f'ALTER TABLE {citação(tabela)} '
                f'ALTER COLUMN id TYPE uuid '
                f'USING (md5(id::text))::uuid'
            )

        for tabela, nome in chaves_primarias:
            cursor.execute(
                f'ALTER TABLE {citação(tabela)} '
                f'ADD CONSTRAINT {citação(nome)} PRIMARY KEY (id)'
            )

        for tabela, nome, definicao, _colunas in chaves_estrangeiras:
            cursor.execute(
                f'ALTER TABLE {citação(tabela)} '
                f'ADD CONSTRAINT {citação(nome)} {definicao}'
            )


class ConverterChavePrimariaParaUUID(Operation):
    """Altera o estado do campo ``id`` e converte os dados no banco."""

    reversible = False

    def __init__(self, app_label, model_name, tabelas_alvo):
        self.app_label = app_label
        self.model_name = model_name
        self.tabelas_alvo = tuple(tabelas_alvo)

    def deconstruct(self):
        return (
            self.__class__.__name__,
            [self.app_label, self.model_name, list(self.tabelas_alvo)],
            {},
        )

    def state_forwards(self, app_label, state):
        campo = models.UUIDField(
            default=uuid.uuid4,
            editable=False,
            primary_key=True,
            serialize=False,
        )
        campo.set_attributes_from_name('id')
        state.alter_field(
            self.app_label,
            self.model_name,
            'id',
            campo,
            preserve_default=True,
        )

    def database_forwards(self, app_label, schema_editor, from_state, to_state):
        if schema_editor.connection.vendor == 'sqlite':
            modelo_antigo = from_state.apps.get_model(
                self.app_label, self.model_name
            )
            modelo_novo = to_state.apps.get_model(self.app_label, self.model_name)
            schema_editor.alter_field(
                modelo_novo,
                modelo_antigo._meta.get_field('id'),
                modelo_novo._meta.get_field('id'),
            )
            return

        if schema_editor.connection.vendor != 'postgresql':
            raise NotImplementedError(
                'Conversão de chave primária para UUID suporta PostgreSQL e '
                'SQLite.'
            )

        _converter_postgresql(schema_editor, self.tabelas_alvo)

    def database_backwards(self, app_label, schema_editor, from_state, to_state):
        raise NotImplementedError(
            'A conversão de chave primária para UUID não é reversível.'
        )


class Migration(migrations.Migration):

    dependencies = [
        ('turmas', '0003_turma_alunos'),
        ('users', '0008_usuario_pk_uuid'),
        ('tarefas', '0002_tarefa_gabarito_tarefa_tipo_and_more'),
    ]

    operations = [
        ConverterChavePrimariaParaUUID('turmas', 'turma', TABELAS_ALVO),
    ]
