from rest_framework.permissions import BasePermission


class IsApiActivated(BasePermission):
    """
    Permission class to check if API access is activated for the tenant
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # For now, allow all authenticated users
        # TODO: Implement actual API activation logic based on tenant configuration
        return True
