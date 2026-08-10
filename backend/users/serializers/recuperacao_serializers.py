from rest_framework import serializers
from users.models import Usuario, TokenDeRecuperacao
import re

class SerializadorSolicitacaoRecuperacao(serializers.Serializer):
    email = serializers.EmailField()

class SerializadorRedefinicaoSenha(serializers.Serializer):
    token = serializers.UUIDField()
    nova_password = serializers.CharField(write_only=True, min_length=8)

    def validate_nova_password(self, valor):
        # Validação de complexidade
        if not re.search(r'[A-Z]', valor):
            raise serializers.ValidationError("A senha deve conter pelo menos uma letra maiúscula.")
        if not re.search(r'[a-z]', valor):
            raise serializers.ValidationError("A senha deve conter pelo menos uma letra minúscula.")
        if not re.search(r'[0-9]', valor):
            raise serializers.ValidationError("A senha deve conter pelo menos um número.")
        if not re.search(r'[^a-zA-Z0-9]', valor):
            raise serializers.ValidationError("A senha deve conter pelo menos um caractere especial (ex: @, #, !, $, etc).")
        return valor

    def validate_token(self, valor):
        try:
            token_obj = TokenDeRecuperacao.objects.get(token=valor)
            if not token_obj.esta_valido():
                raise serializers.ValidationError("Este token é inválido, expirou ou já foi utilizado.")
            return token_obj
        except TokenDeRecuperacao.DoesNotExist:
            raise serializers.ValidationError("Token não encontrado ou formato inválido.")