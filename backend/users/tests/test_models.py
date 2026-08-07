import pytest
from django.contrib.auth import get_user_model

# O Django automaticamente pega a classe Usuario que definimos no settings.py
Usuario = get_user_model()

@pytest.mark.django_db

class TestModeloUsuario:
    
    def test_criar_usuario_aluno_por_padrao(self):
        # Um usuário recém-criado deve ter o perfil de aluno por padrão
        aluno = Usuario.objects.create_user(
            username='aluno_teste', 
            password='senha123'
        )
        
        assert aluno.perfil == 'aluno'
        assert aluno.eh_aluno is True
        assert aluno.eh_professor is False

    def test_criar_usuario_professor(self):
        # Deve ser possível criar um usuário definindo explicitamente o perfil como professor
        professor = Usuario.objects.create_user(
            username='prof_teste', 
            password='senha123', 
            perfil='professor'
        )
        
        assert professor.perfil == 'professor'
        assert professor.eh_professor is True
        assert professor.eh_aluno is False

    def test_senha_utiliza_algoritmo_argon2(self):
        # A senha do usuário deve ser criptografada usando o algoritmo Argon2
        usuario = Usuario.objects.create_user(
            username='hash_teste',
            password='senha_segura_123'
        )
        
        assert usuario.password.startswith('argon2')