import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from users.models.usuario import Usuario
from turmas.models import Turma
from radiografias.models import CasoClinico
from tarefas.models import Tarefa

@pytest.mark.django_db
class TesteCriacaoTarefa:
    def setup_method(self):
        self.cliente = APIClient()
        self.professor = Usuario.objects.create_user(email='prof.tarefa@teste.com', password='123', perfil='professor')
        self.turma = Turma.objects.create(nome="Radiologia 101", professor=self.professor)
        self.aluno = Usuario.objects.create_user(email='aluno.tarefa@teste.com', password='123', perfil='aluno')
        self.caso = CasoClinico.objects.create(
            titulo="Cárie Oculta",
            regiao_anatomica="dentes",
            professor=self.professor
        )
        # comoo a rota sera nomeada
        self.url = reverse('listar-criar-tarefas')

    def teste_professor_cria_tarefa_com_gabarito(self):
        self.cliente.force_authenticate(user=self.professor)
        
        dados = {
            "caso_clinico": self.caso.id,
            "turma": self.turma.id,
            "instrucoes": "Identifique a cárie no dente 46 desenhando o bounding box.",
            "coordenadas_gabarito": {"x_min": 150, "y_min": 200, "x_max": 180, "y_max": 230}
        }
        
        resposta = self.cliente.post(self.url, dados, format='json')
        
        assert resposta.status_code == 201
        assert Tarefa.objects.count() == 1
        
        tarefa_salva = Tarefa.objects.first()
        assert tarefa_salva.coordenadas_gabarito['x_min'] == 150


    def teste_aluno_eh_bloqueado_ao_tentar_criar_tarefa(self):
        self.cliente.force_authenticate(user=self.aluno)
        
        dados = {
            "caso_clinico": self.caso.id,
            "turma": self.turma.id,
            "instrucoes": "Tentativa de invasão",
            "coordenadas_gabarito": {"x_min": 0, "y_min": 0, "x_max": 10, "y_max": 10}
        }
        
        resposta = self.cliente.post(self.url, dados, format='json')
        assert resposta.status_code == 403  # Forbidden
        
    def teste_aluno_consegue_enviar_resolucao_da_tarefa(self):
        tarefa = Tarefa.objects.create(
            caso_clinico=self.caso,
            turma=self.turma,
            instrucoes="Ache a cárie.",
            coordenadas_gabarito={"x_min": 100, "y_min": 100, "x_max": 150, "y_max": 150}
        )

        self.cliente.force_authenticate(user=self.aluno)
        url_resolucao = reverse('resolver-tarefa', kwargs={'pk': tarefa.id})
        
        dados_resolucao = {
            "coordenadas_submetidas": {"x_min": 110, "y_min": 105, "x_max": 140, "y_max": 145}
        }
        
        resposta = self.cliente.post(url_resolucao, dados_resolucao, format='json')
        
        assert resposta.status_code == 201
        assert resposta.data['acertou'] == True