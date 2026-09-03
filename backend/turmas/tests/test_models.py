import pytest
from users.models import Usuario
from turmas.models import Turma

@pytest.mark.django_db
def test_criar_turma_gera_codigo_convite_automatico():
    professor = Usuario.objects.create_user(
        email="professor@radiodent.com",
        password="senha_segura_123",
        nome="Dr. Roberto",
        perfil="Professor"
    )
    
    # cria a turma vinculada a esse professor
    turma = Turma.objects.create(
        nome="Radiografia Panorâmica 2026",
        professor=professor
    )
    
    assert turma.nome == "Radiografia Panorâmica 2026"
    assert turma.professor == professor
    assert turma.codigo_convite is not None
    assert len(turma.codigo_convite) == 6  # O código deve ter exatamente 6 caracteres