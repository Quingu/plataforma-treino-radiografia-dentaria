from rest_framework import serializers
from tarefas.models import Tarefa

class TarefaSerializer(serializers.ModelSerializer):
    caso_clinico_titulo = serializers.CharField(source='caso_clinico.titulo', read_only=True)
    caso_clinico_imagem_url = serializers.SerializerMethodField()
    turma_nome = serializers.CharField(source='turma.nome', read_only=True)
    resolvida = serializers.SerializerMethodField()

    class Meta:
        model = Tarefa
        fields = [
            'id', 'caso_clinico', 'caso_clinico_titulo', 'caso_clinico_imagem_url',
            'turma', 'turma_nome', 'instrucoes', 'coordenadas_gabarito', 'resolvida',
            'criado_em', 'atualizado_em'
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
        if request and url.startswith('/'):
            return request.build_absolute_uri(url)
        return url

    def get_resolvida(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.resolucoes.filter(aluno=request.user).exists()