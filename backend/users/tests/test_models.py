import pytest
from django.contrib.auth import get_user_model

Usuario = get_user_model()

@pytest.mark.django_db
class TestModeloUsuario:
    
    def test_criar_usuario_aluno_por_padrao(self):
        aluno = Usuario.objects.create_user(
            email='aluno_teste@email.com', 
            password='senha123'
        )
        assert aluno.email == 'aluno_teste@email.com'
        assert aluno.perfil == 'aluno'
        assert aluno.check_password('senha123') is True

    def test_criar_usuario_professor(self):
        professor = Usuario.objects.create_user(
            email='prof_teste@email.com',  
            password='senha123',
            perfil='professor'
        )
        assert professor.perfil == 'professor'

    def test_senha_utiliza_algoritmo_argon2(self):
        usuario = Usuario.objects.create_user(
            email='hash_teste@email.com', 
            password='senha_segura_123'
        )
        assert usuario.password.startswith('argon2')