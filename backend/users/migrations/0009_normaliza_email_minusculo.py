"""Normaliza os e-mails já cadastrados para minúsculas.

Contas antigas podem ter sido gravadas exatamente como o usuário digitou
(ex.: ``Aluno.Teste@Email.com``). A partir de agora todo e-mail é salvo em
minúsculas e o login procura sem diferenciar caixa, então os registros
existentes precisam ficar no mesmo formato.

Se houver duas contas que só diferem por maiúsculas/minúsculas, nenhuma das
duas é alterada para não violar a unicidade do e-mail; esse caso precisa ser
resolvido manualmente.
"""

from django.db import migrations


def normalizar_emails(apps, schema_editor):
    Usuario = apps.get_model('users', 'Usuario')

    registros = list(Usuario.objects.values_list('id', 'email'))
    ocupados = {email for _, email in registros if email}

    for usuario_id, email in registros:
        normalizado = (email or '').strip().lower()

        if not email or normalizado == email or normalizado in ocupados:
            continue

        Usuario.objects.filter(pk=usuario_id).update(email=normalizado)
        ocupados.discard(email)
        ocupados.add(normalizado)


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_usuario_pk_uuid'),
    ]

    operations = [
        migrations.RunPython(normalizar_emails, migrations.RunPython.noop),
    ]
