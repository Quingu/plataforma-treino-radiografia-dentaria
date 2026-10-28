from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from tarefas.services.dashboard_professor_service import (
    FiltroInvalido,
    obter_dashboard_professor,
)
from users.seguranca.permissoes import EhProfessor


class DashboardProfessorView(APIView):
    permission_classes = [IsAuthenticated, EhProfessor]

    def get(self, request):
        try:
            dados = obter_dashboard_professor(
                request.user, request.query_params
            )
        except FiltroInvalido as erro:
            return Response({'erro': str(erro)}, status=400)

        return Response(dados)
