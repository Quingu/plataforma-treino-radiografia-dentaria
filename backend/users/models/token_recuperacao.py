import uuid
from datetime import timedelta
from django.db import models
from django.utils import timezone
from .usuario import Usuario

class TokenDeRecuperacao(models.Model):
    usuario = models.ForeignKey(
        Usuario, 
        on_delete=models.CASCADE, 
        related_name='tokens_recuperacao'
    )
    
    # O UUID4 gera um hash criptograficamente seguro e único para o token
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    utilizado = models.BooleanField(default=False)

    def esta_valido(self):
        # Valida se o token não foi usado e se tem menos de 15 minutos de vida
        tempo_limite = timezone.now() - timedelta(minutes=15)
        return not self.utilizado and self.criado_em >= tempo_limite

    def marcar_como_utilizado(self):
        self.utilizado = True
        self.save()

    def __str__(self):
        return f"Token de {self.usuario.email} - Válido: {self.esta_valido()}"