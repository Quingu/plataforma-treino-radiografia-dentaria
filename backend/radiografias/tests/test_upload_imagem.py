import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from users.models.usuario import Usuario
from radiografias.models import CasoClinico

@pytest.mark.django_db
class TesteUploadCasoClinico:
    def setup_method(self):
        self.cliente = APIClient()
        self.professor = Usuario.objects.create_user(email='prof@teste.com', password='123', perfil='professor')
        self.aluno = Usuario.objects.create_user(email='aluno@teste.com', password='123', perfil='aluno')
        self.url = reverse('listar-criar-casos')

    def teste_professor_consegue_fazer_upload_de_caso_clinico(self):
        self.cliente.force_authenticate(user=self.professor)
        # Cria uma imagem de 1 pixel em memória RAM
        imagem_falsa = SimpleUploadedFile(
            name='panoramica_teste.jpg',
            content=b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b',
            content_type='image/jpeg'
        )
        
        dados = {
            'titulo': 'Fratura Radicular',
            'descricao': 'Identifique a linha de fratura no dente 21.',
            'regiao_anatomica': 'maxila',
            'imagem': imagem_falsa
        }
        
        resposta = self.cliente.post(self.url, dados, format='multipart')
        
        assert resposta.status_code == 201
        assert CasoClinico.objects.count() == 1

        caso_salvo = CasoClinico.objects.first()
        assert caso_salvo.professor == self.professor

    def teste_aluno_eh_bloqueado_ao_tentar_fazer_upload(self):
        self.cliente.force_authenticate(user=self.aluno)
        
        dados = {'titulo': 'Tentativa Ilegal'}
        resposta = self.cliente.post(self.url, dados)
        
        assert resposta.status_code == 403
        assert CasoClinico.objects.count() == 0