from rest_framework import serializers
from users.models import ConsentimentoTermos, Usuario

class SerializadorDeUsuario(serializers.ModelSerializer):
    tipo = serializers.CharField(write_only=True, required=False)
    aceitou_termos = serializers.BooleanField(write_only=True)
    versao_termos = serializers.CharField(write_only=True, default='1.0')
    versao_privacidade = serializers.CharField(write_only=True, default='1.0')

    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'nome', 'tipo', 'password', 'aceitou_termos',
            'versao_termos', 'versao_privacidade',
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_aceitou_termos(self, valor):
        if not valor:
            raise serializers.ValidationError(
                'Voce precisa aceitar os Termos de Uso e a Politica de Privacidade.'
            )
        return valor

    def create(self, dados_validados):
        perfil_selecionado = dados_validados.pop('tipo', 'aluno')
        dados_validados.pop('aceitou_termos')
        versao_termos = dados_validados.pop('versao_termos')
        versao_privacidade = dados_validados.pop('versao_privacidade')
        
        novo_usuario = Usuario.objects.create_user(
            email=dados_validados['email'],
            password=dados_validados['password'],
            nome=dados_validados.get('nome', ''),
            perfil=perfil_selecionado
        )
        ConsentimentoTermos.objects.create(
            usuario=novo_usuario,
            versao_termos=versao_termos,
            versao_privacidade=versao_privacidade,
        )
        return novo_usuario