from django.conf import settings
from rest_framework import serializers
from users.models import ConsentimentoTermos, Usuario
from users.models.usuario import normalizar_email

class SerializadorDeUsuario(serializers.ModelSerializer):
    tipo = serializers.CharField(write_only=True, required=False)
    aceitou_termos = serializers.BooleanField(write_only=True)
    versao_termos = serializers.CharField(write_only=True, required=False)
    versao_privacidade = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'nome', 'tipo', 'password', 'aceitou_termos',
            'versao_termos', 'versao_privacidade',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            # A unicidade do e-mail é conferida em validate(), com mensagem
            # genérica, para não permitir enumerar contas cadastradas.
            'email': {'validators': []},
        }

    def validate_email(self, valor):
        # Guarda sempre em minúsculas; a checagem de duplicidade abaixo já é
        # feita sem diferenciar caixa.
        return normalizar_email(valor)

    def validate(self, dados):
        dados = super().validate(dados)
        email = dados.get('email', '')

        if email and Usuario.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                'Não foi possível concluir o cadastro com estes dados.'
            )

        return dados

    def validate_aceitou_termos(self, valor):
        if not valor:
            raise serializers.ValidationError(
                'Voce precisa aceitar os Termos de Uso e a Politica de Privacidade.'
            )
        return valor

    def create(self, dados_validados):
        perfil_selecionado = dados_validados.pop('tipo', 'aluno')
        dados_validados.pop('aceitou_termos')
        dados_validados.pop('versao_termos', None)
        dados_validados.pop('versao_privacidade', None)
        
        novo_usuario = Usuario.objects.create_user(
            email=dados_validados['email'],
            password=dados_validados['password'],
            nome=dados_validados.get('nome', ''),
            perfil=perfil_selecionado
        )
        ConsentimentoTermos.objects.create(
            usuario=novo_usuario,
            versao_termos=settings.VERSAO_TERMOS,
            versao_privacidade=settings.VERSAO_PRIVACIDADE,
        )
        return novo_usuario