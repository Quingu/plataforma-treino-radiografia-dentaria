import pytest
from rest_framework.test import APIRequestFactory
from users.models.usuario import Usuario
from users.seguranca.permissoes import EhProfessorOuSomenteLeitura, EhProfessor

@pytest.mark.django_db
class TestePermissoesRBAC:
    def setup_method(self):
        self.fabrica = APIRequestFactory()
        
        self.aluno = Usuario.objects.create_user(email='aluno@teste.com', password='123', perfil='aluno')
        self.professor = Usuario.objects.create_user(email='prof@teste.com', password='123', perfil='professor')
        
        self.perm_mista = EhProfessorOuSomenteLeitura()
        self.perm_estrita = EhProfessor()

    def teste_aluno_tem_permissao_apenas_de_leitura(self):
        req_leitura = self.fabrica.get('/fake-url/')
        req_leitura.user = self.aluno
        assert self.perm_mista.has_permission(req_leitura, None) is True

        # Teste para ver se o aluno consegue escrever
        req_escrita = self.fabrica.post('/fake-url/')
        req_escrita.user = self.aluno
        assert self.perm_mista.has_permission(req_escrita, None) is False

    def teste_professor_tem_permissao_total(self):
        req_leitura = self.fabrica.get('/fake-url/')
        req_leitura.user = self.professor
        assert self.perm_mista.has_permission(req_leitura, None) is True
        
        req_escrita = self.fabrica.post('/fake-url/')
        req_escrita.user = self.professor
        assert self.perm_mista.has_permission(req_escrita, None) is True

    def teste_permissao_estrita_bloqueia_aluno_completamente(self):
        req_leitura = self.fabrica.get('/fake-url/')
        req_leitura.user = self.aluno
        assert self.perm_estrita.has_permission(req_leitura, None) is False