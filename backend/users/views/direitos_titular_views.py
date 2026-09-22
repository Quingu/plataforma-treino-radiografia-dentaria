from django.core import serializers
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import LogAcesso, SolicitacaoDireitoTitular
from users.services.auditoria_service import registrar_acesso


class ExportarMeusDadosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = request.user
        dados = {
            'usuario': {
                'nome': usuario.nome,
                'email': usuario.email,
                'perfil': usuario.perfil,
            },
            'consentimentos': serializers.serialize('json', usuario.consentimentos.all()),
            'solicitacoes_lgpd': serializers.serialize(
                'json', SolicitacaoDireitoTitular.objects.filter(usuario=usuario)
            ),
        }
        registrar_acesso(
            request, LogAcesso.Evento.EXPORTACAO_DADOS, usuario=usuario, email=usuario.email
        )
        return Response(dados)


class SolicitarDireitoTitularView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tipo = request.data.get('tipo')
        if tipo not in SolicitacaoDireitoTitular.Tipo.values:
            return Response({'erro': 'Tipo de solicitacao invalido.'}, status=status.HTTP_400_BAD_REQUEST)

        solicitacao = SolicitacaoDireitoTitular.objects.create(
            usuario=request.user,
            tipo=tipo,
            descricao=request.data.get('descricao', '')[:2000],
        )
        registrar_acesso(
            request,
            LogAcesso.Evento.SOLICITACAO_DIREITO,
            usuario=request.user,
            email=request.user.email,
            recurso=tipo,
        )
        return Response({'id': solicitacao.id, 'status': solicitacao.status}, status=status.HTTP_201_CREATED)
