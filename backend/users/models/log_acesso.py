from django.conf import settings
from django.db import models


class LogAcesso(models.Model):
    class Evento(models.TextChoices):
        LOGIN_SUCESSO = 'login_sucesso', 'Login realizado'
        LOGIN_FALHOU = 'login_falhou', 'Login negado'
        LOGIN_2FA_PENDENTE = 'login_2fa_pendente', 'Aguardando 2FA'
        LOGIN_2FA_FALHOU = 'login_2fa_falhou', '2FA negado'
        LOGOUT = 'logout', 'Logout realizado'
        ACESSO_RADIOGRAFIA = 'acesso_radiografia', 'Acesso a radiografia'
        ALTERACAO_CRITICA = 'alteracao_critica', 'Alteracao critica'
        EXPORTACAO_DADOS = 'exportacao_dados', 'Exportacao de dados'
        SOLICITACAO_DIREITO = 'solicitacao_direito', 'Solicitacao de direito do titular'

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='logs_acesso',
    )
    email_informado = models.EmailField(blank=True)
    evento = models.CharField(max_length=32, choices=Evento.choices)
    recurso = models.CharField(max_length=120, blank=True)
    ip_hash = models.CharField(max_length=64, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-criado_em']
        indexes = [
            models.Index(fields=['usuario', 'criado_em']),
            models.Index(fields=['evento', 'criado_em']),
        ]

    def __str__(self):
        return f'{self.get_evento_display()} - {self.email_informado} - {self.criado_em:%d/%m/%Y %H:%M}'
