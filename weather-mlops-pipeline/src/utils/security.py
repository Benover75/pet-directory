"""Security utilities for the Weather MLOps Pipeline."""

from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
import secrets
from src.utils.config import get_settings
from src.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token security
security = HTTPBearer()


class SecurityManager:
    """Security manager for authentication and authorization."""
    
    def __init__(self):
        self.api_keys: Dict[str, Dict[str, Any]] = {}
        self.logger = get_logger(__name__)
    
    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt."""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.security.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.security.secret_key, algorithm=settings.security.algorithm)
        
        self.logger.info(
            "access_token_created",
            extra={
                "user_id": data.get("sub"),
                "expires_at": expire.isoformat()
            }
        )
        
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode a JWT token."""
        try:
            payload = jwt.decode(token, settings.security.secret_key, algorithms=[settings.security.algorithm])
            return payload
        except JWTError as e:
            self.logger.warning(
                "token_verification_failed",
                extra={
                    "error": str(e)
                }
            )
            return None
    
    def generate_api_key(self, user_id: str, permissions: list = None) -> str:
        """Generate a new API key for a user."""
        api_key = secrets.token_urlsafe(32)
        self.api_keys[api_key] = {
            "user_id": user_id,
            "permissions": permissions or ["read"],
            "created_at": datetime.utcnow(),
            "last_used": None
        }
        
        self.logger.info(
            "api_key_generated",
            extra={
                "user_id": user_id,
                "permissions": permissions
            }
        )
        
        return api_key
    
    def validate_api_key(self, api_key: str) -> Optional[Dict[str, Any]]:
        """Validate an API key and return user info."""
        if api_key in self.api_keys:
            key_info = self.api_keys[api_key]
            key_info["last_used"] = datetime.utcnow()
            
            self.logger.info(
                "api_key_validated",
                extra={
                    "user_id": key_info["user_id"],
                    "permissions": key_info["permissions"]
                }
            )
            
            return key_info
        return None
    
    def revoke_api_key(self, api_key: str) -> bool:
        """Revoke an API key."""
        if api_key in self.api_keys:
            user_id = self.api_keys[api_key]["user_id"]
            del self.api_keys[api_key]
            
            self.logger.info(
                "api_key_revoked",
                extra={
                    "user_id": user_id
                }
            )
            
            return True
        return False
    
    def check_permission(self, user_info: Dict[str, Any], required_permission: str) -> bool:
        """Check if user has required permission."""
        user_permissions = user_info.get("permissions", [])
        return required_permission in user_permissions or "admin" in user_permissions


# Global security manager instance
security_manager = SecurityManager()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get current user from JWT token."""
    token = credentials.credentials
    payload = security_manager.verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {"user_id": user_id, "permissions": payload.get("permissions", [])}


async def get_current_user_api_key(request: Request) -> Dict[str, Any]:
    """Get current user from API key."""
    api_key = request.headers.get(settings.security.api_key_header)
    
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="API key required",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    
    user_info = security_manager.validate_api_key(api_key)
    if user_info is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    
    return user_info


def require_permission(permission: str):
    """Decorator to require specific permission."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Extract user info from kwargs or request
            user_info = None
            for arg in args:
                if isinstance(arg, dict) and "user_id" in arg:
                    user_info = arg
                    break
            
            if not user_info:
                raise HTTPException(status_code=403, detail="User information not found")
            
            if not security_manager.check_permission(user_info, permission):
                raise HTTPException(
                    status_code=403,
                    detail=f"Permission '{permission}' required"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


class RateLimiter:
    """Simple rate limiter for API endpoints."""
    
    def __init__(self, max_requests: int = 100, window_seconds: int = 3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, list] = {}
        self.logger = get_logger(__name__)
    
    def is_allowed(self, client_id: str) -> bool:
        """Check if request is allowed for client."""
        now = datetime.utcnow()
        
        # Clean old requests
        if client_id in self.requests:
            self.requests[client_id] = [
                req_time for req_time in self.requests[client_id]
                if (now - req_time).total_seconds() < self.window_seconds
            ]
        else:
            self.requests[client_id] = []
        
        # Check if under limit
        if len(self.requests[client_id]) < self.max_requests:
            self.requests[client_id].append(now)
            return True
        
        self.logger.warning(
            "rate_limit_exceeded",
            extra={
                "client_id": client_id,
                "requests_count": len(self.requests[client_id])
            }
        )
        
        return False


# Global rate limiter instance
rate_limiter = RateLimiter()


def rate_limit(client_id: str = None):
    """Decorator for rate limiting."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Extract client ID from request or use default
            if client_id is None:
                # Try to get from request object
                for arg in args:
                    if hasattr(arg, 'client') and hasattr(arg.client, 'host'):
                        client_id_value = arg.client.host
                        break
                else:
                    client_id_value = "default"
            else:
                client_id_value = client_id
            
            if not rate_limiter.is_allowed(client_id_value):
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def sanitize_input(data: str) -> str:
    """Sanitize user input to prevent injection attacks."""
    import html
    return html.escape(data.strip())


def validate_email(email: str) -> bool:
    """Validate email format."""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def log_security_event(event_type: str, details: Dict[str, Any]):
    """Log security events."""
    logger.warning(
        "security_event",
        extra={
            "event_type": event_type,
            **details
        }
    ) 