from django.db import models
from users.models.usuario import Usuario

class Radiografia(models.Model):
    titulo = models.CharField(max_length=255, verbose_name='Título do Caso Clínico')
    descricao = models.TextField(verbose_name='Descrição / Observações')
    regiao_anatomica = models.CharField(max_length=150, verbose_name='Região Anatômica')
    imagem = models.ImageField(upload_to='radiografias/', verbose_name='Arquivo de Imagem')
    
    criado_por = models.ForeignKey(
        Usuario, 
        on_delete=models.CASCADE, 
        limit_choices_to={'perfil': 'professor'},
        verbose_name='Professor Responsável'
    )
    
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name='Data de Criação')

    def __str__(self):
        return f"{self.titulo} - {self.regiao_anatomica}"