from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from users.models import Usuario, TokenDeRecuperacao
from users.seguranca.limitadores import BloqueioDeForcaBruta
from users.serializers.recuperacao_serializers import (
    SerializadorSolicitacaoRecuperacao, 
    SerializadorRedefinicaoSenha
)

class VisaoSolicitarRecuperacaoSenha(APIView):
    classes_de_limitacao = [BloqueioDeForcaBruta]

    def get_throttles(self):
        return [limitador() for limitador in self.classes_de_limitacao]

    def post(self, requisicao):
        serializador = SerializadorSolicitacaoRecuperacao(data=requisicao.data)
        
        if serializador.is_valid():
            email = serializador.validated_data['email']
            
            try:
                # Busca o usuário no banco
                usuario = Usuario.objects.get(email=email)
                novo_token = TokenDeRecuperacao.objects.create(usuario=usuario)
                
                # Monta a URL que o frontend vai processar
                link_recuperacao = f"https://seu-frontend.com/recuperar-senha?token={novo_token.token}"
                
                # Envio do e-mail
                send_mail(
                    subject='Recuperação de Senha - Plataforma de Radiografia',
                    message=f'Você solicitou a recuperação de senha.\n\nAcesse o link abaixo para redefinir sua senha. Este link expira em 15 minutos:\n\n{link_recuperacao}',
                    from_email=settings.DEFAULT_FROM_EMAIL, # O email configurado no settings.py
                    recipient_list=[email],
                    fail_silently=False, # Em produção, se o servidor SMTP cair, isso gera um log de erro útil
                )
                
            except Usuario.DoesNotExist:
                pass

            return Response(
                {"mensagem": "As instruções foram enviadas caso o e-mail exista."}, 
                status=status.HTTP_200_OK
            )
        
        return Response(serializador.errors, status=status.HTTP_400_BAD_REQUEST)


class VisaoRedefinirSenha(APIView):
    classes_de_limitacao = [BloqueioDeForcaBruta]

    def get_throttles(self): # prepara uma lista de limitadores que vão controlar o acesso a uma parte do sistema
        return [limitador() for limitador in self.classes_de_limitacao]

    def post(self, requisicao):
        serializador = SerializadorRedefinicaoSenha(data=requisicao.data)
        
        if serializador.is_valid():
            token_obj = serializador.validated_data['token']
            nova_senha = serializador.validated_data['nova_password']

            usuario = token_obj.usuario
            usuario.set_password(nova_senha)
            usuario.save()
            
            token_obj.marcar_como_utilizado()
            
            return Response(
                {"mensagem": "Senha redefinida com sucesso. Você já pode fazer login."}, 
                status=status.HTTP_200_OK
            )
            
        return Response(serializador.errors, status=status.HTTP_400_BAD_REQUEST)