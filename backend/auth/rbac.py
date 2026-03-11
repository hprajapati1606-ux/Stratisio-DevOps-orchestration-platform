from fastapi import HTTPException, status
import jwt

# Mock RBAC Mapping
ROLE_PERMISSIONS = {
    "admin": ["deploy", "scale", "terminate", "view_costs", "manage_users"],
    "operator": ["deploy", "scale", "view_costs"],
    "viewer": ["view_metrics", "view_costs"]
}

class RBACProcessor:
    @staticmethod
    def check_permission(token: str, required_permission: str):
        """Decodes JWT and checks if user has the required permission."""
        try:
            # In a real app, you'd verify the signature and expiry here
            payload = jwt.decode(token, options={"verify_signature": False})
            role = payload.get("role", "viewer")
            
            allowed_actions = ROLE_PERMISSIONS.get(role, [])
            if required_permission not in allowed_actions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Resource Access Denied: Role '{role}' lacks '{required_permission}' permission"
                )
            return True
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials or session expired"
            )

rbac = RBACProcessor()
