"""Troca a chave primária de Usuario (bigint serial) por UUID.

IDs sequenciais permitiam estimar o tamanho da base e, principalmente,
trocar o número em rotas/parâmetros para tentar acessar dados de outra
pessoa (IDOR). Com UUID o identificador deixa de ser previsível.

A migração preserva todos os registros existentes:

* No PostgreSQL cada inteiro vira ``md5(valor)::uuid`` na tabela principal
  e também em todas as colunas que a referenciam (inclusive tabelas de
  aplicativos de terceiros, como admin e token_blacklist).
* No SQLite (usado apenas nos testes) o próprio Django recria a tabela.
"""

import uuid

from django.db import migrations, models
from django.db.migrations.operations.base import Operation

TABELAS_ALVO = ('users_usuario',)


def _converter_postgresql(schema_editor, tabelas_alvo):
    conexao = schema_editor.connection
    tabelas = list(tabelas_alvo)

    def citação(nome):
        return schema_editor.quote_name(nome)

    with conexao.cursor() as cursor:
        # Chaves estrangeiras que apontam para as tabelas convertidas.
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

        # 1. Remove as restrições: o PostgreSQL não converte o tipo de uma
        #    coluna que participa de chave estrangeira.
        for tabela, nome, _definicao, _colunas in chaves_estrangeiras:
            cursor.execute(
                f'ALTER TABLE {citação(tabela)} DROP CONSTRAINT {citação(nome)}'
            )

        for tabela, nome in chaves_primarias:
            cursor.execute(
                f'ALTER TABLE {citação(tabela)} DROP CONSTRAINT {citação(nome)}'
            )

        # 2. Converte as colunas que referenciam as tabelas alvo. O mesmo
        #    md5 garante que filho e pai continuem apontando um para o outro.
        for tabela, _nome, _definicao, colunas in chaves_estrangeiras:
            for coluna in colunas.split(','):
                cursor.execute(
                    f'ALTER TABLE {citação(tabela)} '
                    f'ALTER COLUMN {citação(coluna)} TYPE uuid '
                    f'USING (md5({citação(coluna)}::text))::uuid'
                )

        # 3. Converte a chave primária. O default/identity antigo (nextval)
        #    não pode ser convertido para uuid e precisa sair antes.
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

        # 4. Recria chaves primárias e estrangeiras.
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
        ('users', '0007_alter_usuario_chave_secreta_2fa_and_more'),
        ('radiografias', '0006_casoclinico_tipo_midia_alter_casoclinico_imagem'),
        ('ranking', '0001_initial'),
        ('tarefas', '0002_tarefa_gabarito_tarefa_tipo_and_more'),
        ('turmas', '0003_turma_alunos'),
    ]

    operations = [
        ConverterChavePrimariaParaUUID('users', 'usuario', TABELAS_ALVO),
    ]
