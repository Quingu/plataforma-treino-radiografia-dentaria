from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from tarefas.models import Tarefa
from tarefas.models.tarefa import TipoTarefa
from tarefas.validators.gabarito_3d_validator import validar_gabarito_3d
from radiografias.models import AcessoRadiografia
from radiografias.services.acesso_radiografia_service import registrar_acesso_radiografia
from radiografias.services.modelo_3d_storage_service import gerar_url_assinada_modelo_3d


def _validar_gabarito_2d(gabarito):
    if not isinstance(gabarito, dict):
        raise serializers.ValidationError(
            {'gabarito': 'O gabarito 2D deve ser um objeto JSON.'}
        )

    if 'x' in gabarito and 'y' in gabarito:
        return gabarito

    if all(campo in gabarito for campo in ('x_min', 'y_min', 'x_max', 'y_max')):
        return gabarito

    raise serializers.ValidationError(
        {'gabarito': 'Informe um ponto (x, y) ou uma área (x_min, y_min, x_max, y_max).'}
    )


class TarefaSerializer(serializers.ModelSerializer):
    caso_clinico_titulo = serializers.CharField(source='caso_clinico.titulo', read_only=True)
    caso_clinico_imagem_url = serializers.SerializerMethodField()
    caso_clinico_modelo_3d_url = serializers.SerializerMethodField()
    caso_clinico_tipo_midia = serializers.CharField(source='caso_clinico.tipo_midia', read_only=True)
    turma_nome = serializers.CharField(source='turma.nome', read_only=True)
    resolvida = serializers.SerializerMethodField()
    gabarito = serializers.JSONField(required=False, allow_null=True)
    coordenadas_gabarito = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = Tarefa
        fields = [
            'id', 'caso_clinico', 'caso_clinico_titulo', 'caso_clinico_imagem_url',
            'caso_clinico_modelo_3d_url', 'caso_clinico_tipo_midia',
            'turma', 'turma_nome', 'instrucoes', 'tipo', 'gabarito',
            'coordenadas_gabarito', 'resolvida', 'criado_em', 'atualizado_em',
        ]
        read_only_fields = ['id', 'criado_em', 'atualizado_em']

    def get_caso_clinico_imagem_url(self, obj):
        imagem = obj.caso_clinico.imagem
        if not imagem:
            return ''

        if imagem.name.startswith('http'):
            return imagem.name

        try:
            url = imagem.url
        except ValueError:
            return ''

        request = self.context.get('request')
        if request and request.user.is_authenticated:
            registrar_acesso_radiografia(
                radiografia=obj.caso_clinico,
                usuario=request.user,
                acao=AcessoRadiografia.Acao.CONSULTA,
                origem='tarefa',
            )
        if request and url.startswith('/'):
            return request.build_absolute_uri(url)
        return url

    def get_caso_clinico_modelo_3d_url(self, obj):
        if not obj.caso_clinico.modelo_3d:
            return ''
        return gerar_url_assinada_modelo_3d(obj.caso_clinico.modelo_3d)

    def get_resolvida(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.resolucoes.filter(aluno=request.user).exists()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')

        pode_ver_gabarito = bool(
            request
            and request.user.is_authenticated
            and request.user.perfil == 'professor'
            and instance.turma.professor_id == request.user.id
        )

        # O gabarito nunca é enviado ao aluno.
        if not pode_ver_gabarito:
            data['gabarito'] = None
            data['coordenadas_gabarito'] = None

        return data

    def validate(self, attrs):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise PermissionDenied('Autenticação obrigatória.')

        if request.user.perfil != 'professor':
            raise PermissionDenied('Somente professores podem criar tarefas.')

        turma = attrs.get('turma') or getattr(self.instance, 'turma', None)
        caso = attrs.get('caso_clinico') or getattr(self.instance, 'caso_clinico', None)

        if turma and turma.professor_id != request.user.id:
            raise serializers.ValidationError(
                {'turma': 'Você não pode criar tarefas em turma de outro professor.'}
            )

        if caso and (
            caso.professor_id != request.user.id
            and caso.visibilidade != 'compartilhada'
        ):
            raise serializers.ValidationError(
                {'caso_clinico': 'Você não pode usar um caso privado de outro professor.'}
            )

        tipo = attrs.get('tipo') or getattr(self.instance, 'tipo', None)

        if not tipo and caso:
            tipo = caso.tipo_midia

        if not tipo:
            tipo = TipoTarefa.RADIOGRAFIA_2D

        if tipo == TipoTarefa.MODELO_3D:
            if not caso or not caso.modelo_3d:
                raise serializers.ValidationError(
                    {'caso_clinico': 'O caso selecionado não possui modelo 3D.'}
                )

            gabarito = (
                attrs.get('gabarito')
                or attrs.get('coordenadas_gabarito')
                or getattr(self.instance, 'gabarito', None)
            )
            if not gabarito:
                raise serializers.ValidationError(
                    {'gabarito': 'Informe o gabarito 3D com ponto e tolerância.'}
                )

            attrs['gabarito'] = validar_gabarito_3d(gabarito)
            attrs['coordenadas_gabarito'] = None
        else:
            if caso and caso.tipo_midia == TipoTarefa.MODELO_3D:
                raise serializers.ValidationError(
                    {'tipo': 'O caso selecionado é um modelo 3D.'}
                )

            gabarito = (
                attrs.get('gabarito')
                or attrs.get('coordenadas_gabarito')
                or getattr(self.instance, 'gabarito_efetivo', None)
            )
            if not gabarito:
                raise serializers.ValidationError(
                    {'gabarito': 'Informe o gabarito da marcação 2D.'}
                )

            gabarito = _validar_gabarito_2d(gabarito)
            attrs['gabarito'] = gabarito
            attrs['coordenadas_gabarito'] = gabarito

        attrs['tipo'] = tipo

        return attrs
