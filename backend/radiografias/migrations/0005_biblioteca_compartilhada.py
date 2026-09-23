# Generated manually for the institutional shared library.
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('radiografias', '0004_acessoradiografia'),
    ]

    operations = [
        migrations.AddField(
            model_name='casoclinico',
            name='visibilidade',
            field=models.CharField(
                choices=[
                    ('privada', 'Privada do professor'),
                    ('compartilhada', 'Biblioteca compartilhada'),
                ],
                db_index=True,
                default='privada',
                max_length=16,
            ),
        ),
        migrations.AlterField(
            model_name='casoclinico',
            name='imagem',
            field=models.ImageField(
                upload_to='uploads-professores/%Y/%m/',
                verbose_name='Arquivo de Imagem',
            ),
        ),
        migrations.AlterField(
            model_name='casoclinico',
            name='professor',
            field=models.ForeignKey(
                blank=True,
                limit_choices_to={'perfil': 'Professor'},
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='casos_enviados',
                to=settings.AUTH_USER_MODEL,
                verbose_name='Professor Responsável',
            ),
        ),
    ]
