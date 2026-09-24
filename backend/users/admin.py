from django.contrib import admin
from django.utils import timezone

from users.models import ConsentimentoTermos, LogAcesso, SolicitacaoDireitoTitular
from users.models.usuario import Usuario


class _SomenteLeituraMixin:
    actions = None

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_view_permission(self, request, obj=None):
        return request.user.is_active and request.user.is_staff


@admin.register(LogAcesso)
class LogAcessoAdmin(_SomenteLeituraMixin, admin.ModelAdmin):
    list_display = ("criado_em", "evento", "usuario", "email_informado", "recurso")
    list_filter = ("evento", "criado_em")
    search_fields = ("email_informado", "recurso", "usuario__email")
    date_hierarchy = "criado_em"
    readonly_fields = (
        "usuario",
        "email_informado",
        "evento",
        "recurso",
        "ip_hash",
        "user_agent",
        "criado_em",
    )
    list_per_page = 50

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("usuario")


@admin.register(ConsentimentoTermos)
class ConsentimentoTermosAdmin(_SomenteLeituraMixin, admin.ModelAdmin):
    list_display = (
        "aceito_em",
        "usuario",
        "versao_termos",
        "versao_privacidade",
        "revogado_em",
    )
    list_filter = ("versao_termos", "versao_privacidade")
    search_fields = ("usuario__email",)
    date_hierarchy = "aceito_em"
    readonly_fields = (
        "usuario",
        "versao_termos",
        "versao_privacidade",
        "aceito_em",
        "revogado_em",
    )
    list_per_page = 50

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("usuario")

    def change_view(self, request, object_id, form_url="", extra_context=None):
        # Audita o próprio acesso do suporte ao dado sensível.
        from users.models import LogAcesso as _Log

        response = super().change_view(request, object_id, form_url, extra_context)
        if request.user.is_authenticated:
            _Log.objects.create(
                usuario=request.user,
                email_informado=request.user.email or "",
                evento=_Log.Evento.ALTERACAO_CRITICA,
                recurso=f"admin:consentimento:{object_id}"[:120],
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
            )
        return response


@admin.register(SolicitacaoDireitoTitular)
class SolicitacaoDireitoTitularAdmin(admin.ModelAdmin):
    list_display = ("criado_em", "usuario", "tipo", "status", "concluido_em")
    list_filter = ("tipo", "status")
    search_fields = ("usuario__email",)
    date_hierarchy = "criado_em"
    actions = None
    list_per_page = 50

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("usuario")

    # Suporte atualiza apenas o status; demais campos são imutáveis
    def get_readonly_fields(self, request, obj=None):
        return ("usuario", "tipo", "descricao", "criado_em", "concluido_em")

    def has_add_permission(self, request):
        # as solicitações veem pelo frontend do titular, não no admin.
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_view_permission(self, request, obj=None):
        return request.user.is_active and request.user.is_staff

    def save_model(self, request, obj, form, change):
        if change and "status" in form.changed_data:
            final = (
                SolicitacaoDireitoTitular.Status.CONCLUIDA,
                SolicitacaoDireitoTitular.Status.RECUSADA,
            )
            if obj.status in final and not obj.concluido_em:
                obj.concluido_em = timezone.now()

            # Trilha de auditoria do atendimento no próprio LogAcesso.
            from users.models import LogAcesso as _Log

            _Log.objects.create(
                usuario=request.user if request.user.is_authenticated else None,
                email_informado=getattr(request.user, "email", "") or "",
                evento=_Log.Evento.ALTERACAO_CRITICA,
                recurso=f"admin:solicitacao:{obj.pk}:{obj.status}"[:120],
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
            )
        super().save_model(request, obj, form, change)


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ("email", "nome", "perfil", "is_active", "is_staff", "date_joined")
    list_filter = ("perfil", "is_active", "is_staff")
    search_fields = ("email", "nome")
    ordering = ("email",)
    actions = None


    readonly_fields = (
        "email",
        "nome",
        "perfil",
        "foto_perfil",
        "last_login",
        "date_joined",
    )
    fields = (
        "email",
        "nome",
        "perfil",
        "foto_perfil",
        "is_active",
        "is_staff",
        "is_superuser",
        "groups",
        "user_permissions",
        "last_login",
        "date_joined",
    )

    def get_readonly_fields(self, request, obj=None):
        # osuporte só pode ativar/desativar conta
        if request.user.is_superuser:
            return ("last_login", "date_joined")
        return (
            "email",
            "nome",
            "perfil",
            "foto_perfil",
            "is_staff",
            "is_superuser",
            "groups",
            "user_permissions",
            "last_login",
            "date_joined",
        )

    def has_add_permission(self, request):
        return False

    # a exclusão de conta ocorre via fluxo LGPD (Solicitacao)
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if change and request.user.is_authenticated:
            from users.models import LogAcesso as _Log

            _Log.objects.create(
                usuario=request.user,
                email_informado=getattr(request.user, "email", "") or "",
                evento=_Log.Evento.ALTERACAO_CRITICA,
                recurso=f"admin:usuario:{obj.pk}"[:120],
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
            )
