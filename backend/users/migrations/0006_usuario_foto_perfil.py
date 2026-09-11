# Generated manually for profile photo support.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_usuario_chave_secreta_2fa'),
    ]

    operations = [
        migrations.AddField(
            model_name='usuario',
            name='foto_perfil',
            field=models.ImageField(blank=True, null=True, upload_to='usuarios/fotos/', verbose_name='Foto de Perfil'),
        ),
    ]
