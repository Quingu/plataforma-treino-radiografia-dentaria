from rest_framework import serializers
from tarefas.models import ResolucaoTarefa
from tarefas.models.tarefa import TipoTarefa
from tarefas.services.avaliacao_tarefa_service import avaliar_resolucao
from tarefas.validators.gabarito_3d_validator import validar_resposta_3d


class ResolucaoSerializer(serializers.ModelSerializer):
    resposta = serializers.JSONField(write_only=True, required=False)
    coordenadas_submetidas = serializers.JSONField(required=False)
    feedback = serializers.SerializerMethodField()
    nome_estrutura = serializers.SerializerMethodField()

    class Meta:
        model = ResolucaoTarefa
        fields = [
            'id', 'resposta', 'coordenadas_submetidas', 'acertou',
            'feedback', 'nome_estrutura', 'criado_em',
        ]
        read_only_fields = ['id', 'acertou', 'criado_em']

    def validate(self, attrs):
        resposta = attrs.pop('resposta', None)
        submissao = attrs.get('coordenadas_submetidas')

        if resposta is not None and submissao is not None:
            raise serializers.ValidationError(
                {'resposta': 'Envie a resposta em apenas um dos campos.'}
            )

        submissao = resposta if resposta is not None else submissao

        if submissao is None:
            raise serializers.ValidationError(
                {'resposta': 'Informe a sua marcação.'}
            )

        if not isinstance(submissao, dict):
            raise serializers.ValidationError(
                {'resposta': 'A resposta deve ser um objeto JSON.'}
            )

        tarefa = self.context.get('tarefa')
        if tarefa and tarefa.tipo == TipoTarefa.MODELO_3D:
            submissao = validar_resposta_3d(submissao)

        attrs['coordenadas_submetidas'] = submissao
        return attrs

    def _resultado(self, obj):
        if not hasattr(obj, '_resultado_avaliacao_cache'):
            obj._resultado_avaliacao_cache = avaliar_resolucao(
                tarefa=obj.tarefa,
                submissao=obj.coordenadas_submetidas or {},
            )
        return obj._resultado_avaliacao_cache

    def get_feedback(self, obj):
        return self._resultado(obj).feedback

    def get_nome_estrutura(self, obj):
        return self._resultado(obj).nome_estrutura
