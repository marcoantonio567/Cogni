from rest_framework.exceptions import PermissionDenied

from .services import ProgressoService


class UserOwnershipMixin:
    ownership_field = 'usuario'

    def get_queryset(self):
        queryset = super().get_queryset()
        usuario = self.request.user
        if not usuario.is_authenticated:
            return queryset.none()
        return queryset.filter(**{self.ownership_field: usuario})

    def ensure_owned(self, obj):
        usuario = self.request.user
        dono = getattr(obj, self.ownership_field, None)
        if dono != usuario:
            raise PermissionDenied('Objeto nao pertence ao usuario autenticado.')
        return obj


class ProgressoMixin:
    progresso_service = ProgressoService

    def atualizar_progresso_do_topico(self, topico):
        self.progresso_service.atualizar_caches_para_topico(topico, self.request.user)
