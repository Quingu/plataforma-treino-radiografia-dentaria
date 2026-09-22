from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import pyotp 
from users.seguranca.segredos import criptografar_segredo, descriptografar_segredo

class UsuarioGerenciador(BaseUserManager):
    def create_user(self, email, password=None, **campos_extras):
        if not email:
            raise ValueError('O campo de e-mail é obrigatório')
        email = self.normalize_email(email)
        usuario = self.model(email=email, **campos_extras)
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, email, password=None, **campos_extras):
        campos_extras.setdefault('is_staff', True)
        campos_extras.setdefault('is_superuser', True)
        return self.create_user(email, password, **campos_extras)

class Usuario(AbstractUser):
    username = None
    email = models.EmailField(unique=True, verbose_name='E-mail')
    
    OPCOES_PERFIL = (
        ('aluno', 'Aluno'),
        ('professor', 'Professor'),
    )
    
    nome = models.CharField(
        max_length=255, 
        verbose_name='Nome Completo',
        blank=True,
        null=True
    )
    
    perfil = models.CharField(
        max_length=15, 
        choices=OPCOES_PERFIL, 
        default='aluno',
        verbose_name='Perfil'
    )

    chave_secreta_2fa = models.CharField(
        max_length=512,
        blank=True, 
        null=True,
        verbose_name='Chave Secreta 2FA'
    )

    foto_perfil = models.ImageField(
        upload_to='usuarios/fotos/',
        blank=True,
        null=True,
        verbose_name='Foto de Perfil'
    )

    objects = UsuarioGerenciador()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome']

    def __str__(self):
        return f"{self.email} - {self.get_perfil_display()}"
    
    @property
    def eh_professor(self):
        return self.perfil == 'professor'

    @property
    def eh_aluno(self):
        return self.perfil == 'aluno'

    def gerar_chave_2fa(self):
        if not self.chave_secreta_2fa:
            self.chave_secreta_2fa = criptografar_segredo(pyotp.random_base32())
            self.save()
        return descriptografar_segredo(self.chave_secreta_2fa)

    def obter_chave_2fa(self):
        return descriptografar_segredo(self.chave_secreta_2fa)
