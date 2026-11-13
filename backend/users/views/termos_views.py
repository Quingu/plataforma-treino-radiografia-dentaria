from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import LogAcesso
from users.services.auditoria_service import registrar_acesso
from users.services.termos_service import (
    aceite_pendente,
    consentimento_vigente,
    registrar_aceite,
    versoes_atuais,
)


class TermosDeUsoView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request):
        atuais = versoes_atuais()
        dados = {
            'versao_termos': atuais['termos'],
            'versao_privacidade': atuais['privacidade'],
        }

        if request.user.is_authenticated:
            consentimento = consentimento_vigente(request.user)
            dados['aceite_pendente'] = aceite_pendente(request.user)
            dados['aceito_em'] = consentimento.aceito_em if consentimento else None
            dados['versao_termos_aceita'] = (
                consentimento.versao_termos if consentimento else None
            )
            dados['versao_privacidade_aceita'] = (
                consentimento.versao_privacidade if consentimento else None
            )

        return Response(dados)

    def post(self, request):
        if not request.data.get('aceitou_termos'):
            return Response(
                {'erro': 'É necessário aceitar os Termos de Uso e a Política de Privacidade.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        consentimento = registrar_aceite(request.user)
        registrar_acesso(
            request,
            LogAcesso.Evento.ALTERACAO_CRITICA,
            usuario=request.user,
            email=request.user.email,
            recurso=f'termos:{consentimento.versao_termos}',
        )

        atuais = versoes_atuais()
        return Response(
            {
                'aceite_pendente': False,
                'aceito_em': consentimento.aceito_em,
                'versao_termos': atuais['termos'],
                'versao_privacidade': atuais['privacidade'],
                'versao_termos_aceita': consentimento.versao_termos,
                'versao_privacidade_aceita': consentimento.versao_privacidade,
            }
        )
