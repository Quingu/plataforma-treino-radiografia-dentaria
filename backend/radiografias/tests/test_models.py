import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from users.models import Usuario
from radiografias.models import Radiografia

@pytest.mark.django_db
class TesteModeloRadiografia:
    def test_deve_criar_uma_radiografia_com_sucesso(self):
        # Cria um professor para ser o autor do caso
        professor = Usuario.objects.create_user(
            email='professor@email.com',
            password='SenhaForte123',
            nome='Prof. Doutor',
            perfil='professor'
        )

        # Simula o upload de uma imagem de radiografia de teste
        imagem_falsa = SimpleUploadedFile(
            name='teste_rx.jpg',
            content=b'\x47\x49\x46\x38\x39\x61',  # Bytes simulados de imagem
            content_type='image/jpeg'
        )

        # Cria o registro da radiografia
        radiografia = Radiografia.objects.create(
            titulo='Radiografia Periapical - Elemento 36',
            descricao='Análise de lesão periapical no molar inferior esquerdo.',
            regiao_anatomica='Posterior Mandíbula',
            imagem=imagem_falsa,
            criado_por=professor
        )

        assert radiografia.id is not None
        assert radiografia.titulo == 'Radiografia Periapical - Elemento 36'
        assert radiografia.criado_por.perfil == 'professor'
        assert radiografia.imagem.name is not None