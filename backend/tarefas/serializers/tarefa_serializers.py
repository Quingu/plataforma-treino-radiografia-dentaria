from rest_framework import serializers
from tarefas.models import Tarefa
from radiografias.models import AcessoRadiografia
from radiografias.services.acesso_radiografia_service import registrar_acesso_radiografia

class TarefaSerializer(serializers.ModelSerializer):
    caso_clinico_titulo = serializers.CharField(source='caso_clinico.titulo', read_only=True)
    caso_clinico_imagem_url = serializers.SerializerMethodField()
    coordenadas_gabarito = serializers.SerializerMethodField()
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

    def get_coordenadas_gabarito(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.perfil == 'professor':
            if obj.turma.professor_id == request.user.id:
                return obj.coordenadas_gabarito
        return None

    def validate(self, attrs):
        request = self.context.get('request')
        if not request or request.user.perfil != 'professor':
            return attrs

        turma = attrs.get('turma')
        caso = attrs.get('caso_clinico')
        if turma and turma.professor_id != request.user.id:
            raise serializers.ValidationError({'turma': 'Voce nao pode criar tarefas em turma de outro professor.'})
        if caso and (
            caso.professor_id != request.user.id
            and caso.visibilidade != 'compartilhada'
        ):
            raise serializers.ValidationError(
        {
            'caso_clinico': (
                'Você não pode usar radiografia privada de outro professor.'
            )
        }
    )
        return attrs

    def get_resolvida(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.resolucoes.filter(aluno=request.user).exists()
