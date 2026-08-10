from rest_framework.throttling import AnonRateThrottle

class BloqueioDeForcaBruta(AnonRateThrottle):
    """
    Limita as tentativas de requisição baseadas no IP do usuário
    Utiliza o escopo 'login_brute_force' definido no settings.py (3 tentativas/min).
    """
    scope = 'login_brute_force'