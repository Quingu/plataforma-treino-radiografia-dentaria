from django.contrib import admin
from radiografias.models import AcessoRadiografia


@admin.register(AcessoRadiografia)
class AcessoRadiografiaAdmin(admin.ModelAdmin):
    list_display = ("criado_em", "radiografia", "usuario", "acao", "origem")
    list_filter = ("acao", "criado_em")
    search_fields = ("usuario__email", "radiografia__id", "origem")
    date_hierarchy = "criado_em"
    readonly_fields = ("radiografia", "usuario", "acao", "origem", "criado_em")
    actions = None
    list_per_page = 50

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("usuario", "radiografia")

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_view_permission(self, request, obj=None):
        return request.user.is_active and request.user.is_staff

    def change_view(self, request, object_id, form_url="", extra_context=None):
        response = super().change_view(request, object_id, form_url, extra_context)
        if request.user.is_authenticated:
            from users.models import LogAcesso as _Log

            _Log.objects.create(
                usuario=request.user,
                email_informado=getattr(request.user, "email", "") or "",
                evento=_Log.Evento.ALTERACAO_CRITICA,
                recurso=f"admin:acessoradiografia:{object_id}"[:120],
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
            )
        return response
