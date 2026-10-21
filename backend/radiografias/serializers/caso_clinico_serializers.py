from django.core.files.uploadedfile import UploadedFile
from rest_framework import serializers
from radiografias.models import CasoClinico
from radiografias.models.caso_clinico import TipoMidia
from radiografias.services.modelo_3d_storage_service import (
    Modelo3DInvalido,
    gerar_url_assinada_modelo_3d,
    validar_arquivo_modelo_3d,
)


class SerializadorCasoClinico(serializers.ModelSerializer):
    imagem_url = serializers.SerializerMethodField()
    modelo_3d_url = serializers.SerializerMethodField()

    class Meta:
        model = CasoClinico
        fields = [
            'id', 'titulo', 'descricao', 'regiao_anatomica', 'tipo_midia',
            'imagem', 'imagem_url', 'modelo_3d', 'modelo_3d_url',
            'professor', 'criado_em',
        ]
        read_only_fields = ['id', 'professor', 'criado_em']
        extra_kwargs = {
            'imagem': {'required': False, 'allow_null': True},
            'modelo_3d': {'required': False, 'allow_null': True},
        }

    def get_imagem_url(self, obj):
        if not obj.imagem:
            return ''

        if obj.imagem.name.startswith('http'):
            return obj.imagem.name

        try:
            url = obj.imagem.url
        except ValueError:
            return ''

        request = self.context.get('request')
        if request and url.startswith('/'):
            return request.build_absolute_uri(url)
        return url

    def get_modelo_3d_url(self, obj):
        if not obj.modelo_3d:
            return ''
        return gerar_url_assinada_modelo_3d(obj.modelo_3d)

    def validate(self, attrs):
        instancia = self.instance
        tipo_midia = attrs.get(
            'tipo_midia',
            getattr(instancia, 'tipo_midia', TipoMidia.RADIOGRAFIA_2D),
        )
        imagem = attrs.get('imagem', getattr(instancia, 'imagem', None))
        modelo_3d = attrs.get('modelo_3d', getattr(instancia, 'modelo_3d', None))

        if isinstance(modelo_3d, UploadedFile):
            try:
                validar_arquivo_modelo_3d(modelo_3d)
            except Modelo3DInvalido as erro:
                raise serializers.ValidationError({'modelo_3d': str(erro)}) from erro

        if tipo_midia == TipoMidia.MODELO_3D:
            if not modelo_3d:
                raise serializers.ValidationError(
                    {'modelo_3d': 'Informe o arquivo .glb do modelo 3D.'}
                )
            if imagem:
                raise serializers.ValidationError(
                    {'imagem': 'Um caso de modelo 3D não deve possuir imagem 2D.'}
                )
            attrs['imagem'] = None
        else:
            if not imagem:
                raise serializers.ValidationError(
                    {'imagem': 'Informe a imagem da radiografia.'}
                )
            if modelo_3d:
                raise serializers.ValidationError(
                    {'modelo_3d': 'Um caso de radiografia 2D não deve possuir modelo 3D.'}
                )

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['professor'] = request.user
        return super().create(validated_data)
