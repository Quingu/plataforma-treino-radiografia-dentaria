import pytest
from rest_framework.test import APIClient
from users.models import Usuario
from turmas.models import Turma

@pytest.mark.django_db
def test_professor_pode_criar_turma():
    client = APIClient()
    professor = Usuario.objects.create_user(
        email="professor@radiodent.com",
        password="senha_segura",
        nome="Dr. Roberto",
        perfil="Professor"
    )
    
    # simula o login do professor
    client.force_authenticate(user=professor)
    
    # Envi uam requisição POST para criar a turma
    payload = {"nome": "Radiografia Panorâmica 2026"}
    response = client.post("/api/turmas/", payload, format="json")

    assert response.status_code == 201 
    assert response.data["nome"] == "Radiografia Panorâmica 2026"
    assert "codigo_convite" in response.data 
    
    assert Turma.objects.count() == 1
    turma_salva = Turma.objects.first()
    assert turma_salva.professor == professor


@pytest.mark.django_db
def test_aluno_pode_entrar_na_turma_com_codigo():
    client = APIClient()
    professor = Usuario.objects.create_user(
        email="prof@radiodent.com", password="123", perfil="Professor"
    )
    turma = Turma.objects.create(nome="Radiografia Panorâmica 2026", professor=professor)
    
    aluno = Usuario.objects.create_user(
        email="aluno@radiodent.com", password="123", perfil="Aluno"
    )

    client.force_authenticate(user=aluno)
    
    # O aluno envia o código
    payload = {"codigo_convite": turma.codigo_convite}
    response = client.post(f"/api/turmas/{turma.id}/enrollments/", payload, format="json")

    assert response.status_code == 200
    assert "Matrícula realizada" in response.data["mensagem"]
   
    turma.refresh_from_db()
    assert aluno in turma.alunos.all()    