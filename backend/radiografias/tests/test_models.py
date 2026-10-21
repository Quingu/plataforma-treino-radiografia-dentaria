import pytest
from users.models import Usuario
from radiografias.models import CasoClinico

@pytest.mark.django_db
class TesteModeloCasoClinico:
    def test_deve_criar_um_caso_clinico_com_sucesso(self):
        # Cria um professor para ser o autor do caso
        professor = Usuario.objects.create_user(
            email='professor@email.com',
            password='SenhaForte123',
            nome='Prof. Doutor',
            perfil='professor'
        )

        # Cria o registro do caso clínico
        caso = CasoClinico.objects.create(
            titulo='Radiografia Periapical - Elemento 36',
            descricao='Análise de lesão periapical no molar inferior esquerdo.',
            regiao_anatomica='mandibula',
            imagem='radiografias/teste_rx.jpg',
            professor=professor,
        )

        assert caso.id is not None
        assert caso.titulo == 'Radiografia Periapical - Elemento 36'
        assert caso.professor.perfil == 'professor'
        assert caso.tipo_midia == 'radiografia_2d'
        assert caso.imagem.name is not None
