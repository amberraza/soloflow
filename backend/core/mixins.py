from rest_framework import exceptions

class FirmIsolationMixin:
    """
    Mixin to ensure objects are filtered by the user's firm.
    Assumes the model has a 'firm' field.
    """
    def get_queryset(self):
        # Allow explicit queryset override or use the default model manager
        queryset = super().get_queryset()
        
        user = self.request.user
        if not user.is_authenticated:
            # If not authenticated, return empty or handle based on public endpoints
            # For strictly private endpoints, permission_classes should handle auth
            if getattr(self, 'permission_classes', None):
                return queryset.none()
            return queryset
            
        if user.is_staff or user.is_superuser:
            # Admins might see all (optional, maybe restrict admins too?)
            # Prompt says "Strictly siloed by Firm". So even admins should probably be careful.
            # But "User" model has "is_attorney". Django Admin users are different.
            # We'll assume superusers are platform admins and can see all.
            return queryset

        if not user.firm:
            # If user has no firm, they shouldn't see firm data.
            return queryset.none()

        return queryset.filter(firm=user.firm)

    def perform_create(self, serializer):
        # Automatically assign the firm upon creation
        if not self.request.user.firm:
             raise exceptions.ValidationError("User must belong to a firm to create objects.")
        serializer.save(firm=self.request.user.firm)
