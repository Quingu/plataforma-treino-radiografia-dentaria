from rest_framework import permissions

class EhProfessorOuSomenteLeitura(permissions.BasePermission):
    def has_permission(self, request, view):
        # Bloqueia usuários não logados
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
            
        return request.user.perfil == 'professor'


class EhProfessor(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.perfil == 'professor')