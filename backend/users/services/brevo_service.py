import requests
from django.conf import settings

def enviar_email_brevo(destinatario_email, destinatario_nome, assunto, html_conteudo):
    url = "https://api.brevo.com/v3/smtp/email"
    
    headers = {
        "accept": "application/json",
        "api-key": getattr(settings, "BREVO_API_KEY", ""),
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {
            "name": "RadioDent TCC",
            "email": getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@radiodent.com")
        },
        "to": [
            {
                "email": destinatario_email,
                "name": destinatario_nome
            }
        ],
        "subject": assunto,
        "htmlContent": html_conteudo
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code in [200, 201, 202]:
        return True, response.json()
    else:
        return False, response.json()