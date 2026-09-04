from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from users.models import Usuario, TokenDeRecuperacao
from users.seguranca.limitadores import BloqueioDeForcaBruta
from users.serializers.recuperacao_serializers import (
    SerializadorSolicitacaoRecuperacao, 
    SerializadorRedefinicaoSenha
)
from users.services.brevo_service import enviar_email_brevo

class SolicitarRecuperacaoSenhaView(APIView):
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
                
                # Assunto do e-mail em HTML para a Brevo
                assunto = "Recuperação de Senha - Plataforma de Radiografia"
                html_conteudo = f"""
                    <h2>Olá, {usuario.nome}</h2>
                    <p>Você solicitou a recuperação de senha para a sua conta na plataforma de treino de radiografia.</p>
                    <p>Acesse o link abaixo para redefinir sua senha. <b>Este link expira em 15 minutos:</b></p>
                    <p><a href="{link_recuperacao}" target="_blank">Redefinir Minha Senha</a></p>
                    <p>Se você não solicitou isso, ignore este e-mail.</p>
                """
                
                # envio do e-mail via API da Brevo
                sucesso, resposta = enviar_email_brevo(usuario.email, usuario.nome, assunto, html_conteudo)
                
                if not sucesso:
                    pass
                
            except Usuario.DoesNotExist:
                pass

            return Response(
                {"mensagem": "As instruções foram enviadas caso o e-mail exista."}, 
                status=status.HTTP_200_OK
            )
        
        return Response(serializador.errors, status=status.HTTP_400_BAD_REQUEST)


class RedefinirSenhaView(APIView):
    classes_de_limitacao = [BloqueioDeForcaBruta]

    def get_throttles(self):
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