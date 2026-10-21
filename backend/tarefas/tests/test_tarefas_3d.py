import math

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from radiografias.models import CasoClinico
from radiografias.serializers.caso_clinico_serializers import SerializadorCasoClinico
from radiografias.services.modelo_3d_storage_service import gerar_url_assinada_modelo_3d
from tarefas.models import Tarefa
from turmas.models import Turma
from users.models.usuario import Usuario


GABARITO_3D = {
    'versao': 1,
    'modo': 'ponto_3d',
    'nome_estrutura': 'Cúspide mesiovestibular',
    'malha': 'Crown',
    'ponto_local': {'x': 0.12, 'y': 0.48, 'z': -0.07},
    'tolerancia': 0.03,
}


def arquivo_glb(nome='dente.glb', conteudo=b'glTF' + b'\x00' * 64):
    return SimpleUploadedFile(nome, conteudo, content_type='model/gltf-binary')


@pytest.mark.django_db
class TesteTarefas3D:
    def setup_method(self):
        self.cliente = APIClient()

        self.professor = Usuario.objects.create_user(
            email='prof3d@teste.com', password='123', perfil='professor'
        )
        self.outro_professor = Usuario.objects.create_user(
            email='prof3d.outro@teste.com', password='123', perfil='professor'
        )
        self.aluno = Usuario.objects.create_user(
            email='aluno3d@teste.com', password='123', perfil='aluno'
        )
        self.outro_aluno = Usuario.objects.create_user(
            email='aluno3d.outro@teste.com', password='123', perfil='aluno'
        )

        self.turma = Turma.objects.create(nome='Turma 3D', professor=self.professor)
        self.turma.alunos.add(self.aluno)
        self.turma_outro = Turma.objects.create(
            nome='Turma de outro professor', professor=self.outro_professor
        )
        self.turma_outro.alunos.add(self.outro_aluno)

        self.caso_compartilhado = CasoClinico.objects.create(
            titulo='Incisivo central',
            descricao='Modelo institucional.',
            regiao_anatomica='dentes',
            tipo_midia='modelo_3d',
            modelo_3d='modelos_3d/incisivo.glb',
            imagem='',
            visibilidade=CasoClinico.Visibilidade.COMPARTILHADA,
        )
        self.caso_privado = CasoClinico.objects.create(
            titulo='Molar privado',
            descricao='Modelo do professor.',
            regiao_anatomica='dentes',
            tipo_midia='modelo_3d',
            modelo_3d='modelos_3d/molar.glb',
            imagem='',
            professor=self.professor,
        )
        self.caso_2d = CasoClinico.objects.create(
            titulo='Radiografia 2D',
            descricao='Caso legado.',
            regiao_anatomica='dentes',
            imagem='radiografias/2026/09/teste.jpg',
            professor=self.professor,
        )

        self.url_tarefas = reverse('listar-criar-tarefas')

    def _resolver(self, tarefa, resposta):
        return self.cliente.post(
            reverse('resolver-tarefa', kwargs={'pk': tarefa.id}),
            {'resposta': resposta},
            format='json',
        )

    def test_aluno_recebe_403_ao_criar_tarefa(self):
        self.cliente.force_authenticate(user=self.aluno)

        resposta = self.cliente.post(
            self.url_tarefas,
            {
                'caso_clinico': self.caso_privado.id,
                'turma': self.turma.id,
                'instrucoes': 'Tentativa ilegal.',
                'tipo': 'modelo_3d',
                'gabarito': GABARITO_3D,
            },
            format='json',
        )

        assert resposta.status_code == 403
        assert Tarefa.objects.count() == 0

    def test_professor_nao_vincula_turma_de_outro_professor(self):
        self.cliente.force_authenticate(user=self.professor)

        resposta = self.cliente.post(
            self.url_tarefas,
            {
                'caso_clinico': self.caso_compartilhado.id,
                'turma': self.turma_outro.id,
                'instrucoes': 'Turma indevida.',
                'tipo': 'modelo_3d',
                'gabarito': GABARITO_3D,
            },
            format='json',
        )

        assert resposta.status_code == 400
        assert 'turma' in resposta.data

    def test_professor_cria_tarefa_a_partir_de_modelo_compartilhado(self):
        self.cliente.force_authenticate(user=self.professor)

        resposta = self.cliente.post(
            self.url_tarefas,
            {
                'caso_clinico': self.caso_compartilhado.id,
                'turma': self.turma.id,
                'instrucoes': 'Marque a cúspide.',
                'tipo': 'modelo_3d',
                'gabarito': GABARITO_3D,
            },
            format='json',
        )

        assert resposta.status_code == 201
        tarefa = Tarefa.objects.get()
        assert tarefa.tipo == 'modelo_3d'
        assert tarefa.gabarito['ponto_local']['x'] == pytest.approx(0.12)

    def test_professor_nao_usa_modelo_privado_de_outro_professor(self):
        caso_do_outro = CasoClinico.objects.create(
            titulo='Modelo alheio',
            descricao='Privado.',
            regiao_anatomica='dentes',
            tipo_midia='modelo_3d',
            modelo_3d='modelos_3d/alheio.glb',
            imagem='',
            professor=self.outro_professor,
        )
        self.cliente.force_authenticate(user=self.professor)

        resposta = self.cliente.post(
            self.url_tarefas,
            {
                'caso_clinico': caso_do_outro.id,
                'turma': self.turma.id,
                'instrucoes': 'Modelo alheio.',
                'tipo': 'modelo_3d',
                'gabarito': GABARITO_3D,
            },
            format='json',
        )

        assert resposta.status_code == 400
        assert 'caso_clinico' in resposta.data

    def test_aluno_so_lista_tarefas_das_turmas_em_que_esta_matriculado(self):
        tarefa_minha = Tarefa.objects.create(
            caso_clinico=self.caso_compartilhado,
            turma=self.turma,
            instrucoes='Minha tarefa.',
            tipo='modelo_3d',
            gabarito=GABARITO_3D,
        )
        Tarefa.objects.create(
            caso_clinico=self.caso_compartilhado,
            turma=self.turma_outro,
            instrucoes='Tarefa de outro aluno.',
            tipo='modelo_3d',
            gabarito=GABARITO_3D,
        )

        self.cliente.force_authenticate(user=self.aluno)
        resposta = self.cliente.get(self.url_tarefas)

        assert resposta.status_code == 200
        assert [item['id'] for item in resposta.data] == [str(tarefa_minha.id)]

    def test_resposta_3d_dentro_da_tolerancia_acerta(self):
        tarefa = Tarefa.objects.create(
            caso_clinico=self.caso_compartilhado,
            turma=self.turma,
            instrucoes='Marque a cúspide.',
            tipo='modelo_3d',
            gabarito=GABARITO_3D,
        )
        self.cliente.force_authenticate(user=self.aluno)

        resposta = self._resolver(
            tarefa,
            {
                'modo': 'ponto_3d',
                'malha': 'Crown',
                'ponto_local': {'x': 0.11, 'y': 0.47, 'z': -0.06},
            },
        )

        assert resposta.status_code == 201
        assert resposta.data['acertou'] is True
        assert resposta.data['nome_estrutura'] == 'Cúspide mesiovestibular'

    def test_resposta_3d_fora_da_tolerancia_erra(self):
        tarefa = Tarefa.objects.create(
            caso_clinico=self.caso_compartilhado,
            turma=self.turma,
            instrucoes='Marque a cúspide.',
            tipo='modelo_3d',
            gabarito=GABARITO_3D,
        )
        self.cliente.force_authenticate(user=self.aluno)

        resposta = self._resolver(
            tarefa,
            {
                'modo': 'ponto_3d',
                'ponto_local': {'x': 0.40, 'y': 0.48, 'z': -0.07},
            },
        )

        assert resposta.status_code == 201
        assert resposta.data['acertou'] is False
        assert resposta.data['nome_estrutura'] == ''

        distancia = math.dist((0.40, 0.48, -0.07), (0.12, 0.48, -0.07))
        assert distancia > GABARITO_3D['tolerancia']

    def test_resposta_do_aluno_nao_contem_gabarito(self):
        tarefa = Tarefa.objects.create(
            caso_clinico=self.caso_compartilhado,
            turma=self.turma,
            instrucoes='Marque a cúspide.',
            tipo='modelo_3d',
            gabarito=GABARITO_3D,
        )
        self.cliente.force_authenticate(user=self.aluno)

        listagem = self.cliente.get(self.url_tarefas)
        assert listagem.status_code == 200
        assert listagem.data[0]['gabarito'] is None
        assert listagem.data[0]['coordenadas_gabarito'] is None

        resposta = self._resolver(
            tarefa,
            {'ponto_local': {'x': 0.12, 'y': 0.48, 'z': -0.07}},
        )
        assert resposta.status_code == 201
        assert 'gabarito' not in resposta.data
        assert 'coordenadas_gabarito' not in resposta.data

    def test_professor_dono_visualiza_gabarito(self):
        tarefa = Tarefa.objects.create(
            caso_clinico=self.caso_compartilhado,
            turma=self.turma,
            instrucoes='Marque a cúspide.',
            tipo='modelo_3d',
            gabarito=GABARITO_3D,
        )
        self.cliente.force_authenticate(user=self.professor)

        resposta = self.cliente.get(self.url_tarefas)
        assert resposta.status_code == 200
        assert resposta.data[0]['id'] == str(tarefa.id)
        assert resposta.data[0]['gabarito']['ponto_local']['x'] == pytest.approx(0.12)

    def test_url_do_modelo_e_assinada_e_temporaria(self):
        url = gerar_url_assinada_modelo_3d(self.caso_compartilhado.modelo_3d)
        dados = SerializadorCasoClinico(self.caso_compartilhado).data

        assert url.startswith('https://')
        assert 'X-Amz-Signature=' in url
        assert 'X-Amz-Expires=300' in url
        assert dados['modelo_3d_url'] == url
        assert dados['modelo_3d_url'].startswith('https://')

    def test_url_do_console_e_normalizada_para_a_chave_do_objeto(self):
        valor = (
            'https://console.scaleway.com/object-storage/buckets/radiodent-pfc/'
            'modelos_3d/dente.glb?token=abc'
        )
        url = gerar_url_assinada_modelo_3d(valor)

        assert 'X-Amz-Signature=' in url
        assert '/modelos_3d/dente.glb?' in url

    def test_arquivo_diferente_de_glb_e_recusado(self):
        self.cliente.force_authenticate(user=self.professor)

        resposta = self.cliente.post(
            reverse('listar-criar-casos'),
            {
                'titulo': 'Modelo inválido',
                'descricao': 'Teste.',
                'regiao_anatomica': 'dentes',
                'tipo_midia': 'modelo_3d',
                'modelo_3d': SimpleUploadedFile(
                    'dente.obj', b'v 0 0 0', content_type='text/plain'
                ),
            },
            format='multipart',
        )

        assert resposta.status_code == 400
        assert 'modelo_3d' in resposta.data

    @override_settings(MODELO_3D_MAX_BYTES=10)
    def test_arquivo_excessivamente_grande_e_recusado(self):
        self.cliente.force_authenticate(user=self.professor)

        resposta = self.cliente.post(
            reverse('listar-criar-casos'),
            {
                'titulo': 'Modelo grande',
                'descricao': 'Teste.',
                'regiao_anatomica': 'dentes',
                'tipo_midia': 'modelo_3d',
                'modelo_3d': arquivo_glb(conteudo=b'glTF' + b'\x00' * 64),
            },
            format='multipart',
        )

        assert resposta.status_code == 400
        assert 'modelo_3d' in resposta.data

    def test_glb_com_mime_invalido_e_recusado(self):
        self.cliente.force_authenticate(user=self.professor)

        resposta = self.cliente.post(
            reverse('listar-criar-casos'),
            {
                'titulo': 'Modelo com MIME inválido',
                'descricao': 'Teste.',
                'regiao_anatomica': 'dentes',
                'tipo_midia': 'modelo_3d',
                'modelo_3d': SimpleUploadedFile(
                    'dente.glb',
                    b'glTF' + b'\x00' * 64,
                    content_type='text/plain',
                ),
            },
            format='multipart',
        )

        assert resposta.status_code == 400
        assert 'modelo_3d' in resposta.data

    def test_glb_com_conteudo_invalido_e_recusado(self):
        self.cliente.force_authenticate(user=self.professor)

        resposta = self.cliente.post(
            reverse('listar-criar-casos'),
            {
                'titulo': 'Modelo corrompido',
                'descricao': 'Teste.',
                'regiao_anatomica': 'dentes',
                'tipo_midia': 'modelo_3d',
                'modelo_3d': arquivo_glb(conteudo=b'nope'),
            },
            format='multipart',
        )

        assert resposta.status_code == 400
        assert 'modelo_3d' in resposta.data

    def test_rota_legada_continua_funcionando(self):
        self.cliente.force_authenticate(user=self.professor)

        resposta = self.cliente.get('/api/tarefas/tarefas/')

        assert resposta.status_code == 200
