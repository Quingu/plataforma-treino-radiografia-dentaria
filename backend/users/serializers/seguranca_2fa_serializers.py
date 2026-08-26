from rest_framework import serializers

class SerializadorVerificacao2FA(serializers.Serializer):
    codigo = serializers.CharField(
        max_length=6, 
        min_length=6,
        error_messages={
            'max_length': 'O código deve ter exatamente 6 dígitos.',
            'min_length': 'O código deve ter exatamente 6 dígitos.'
        }
    )