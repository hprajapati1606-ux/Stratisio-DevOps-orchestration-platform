from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional
import jwt

# JWT Security Settings
SECRET_KEY = "SUPER_SECRET_KEY_FOR_DEMO"  # In production, use environment variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

auth_router = APIRouter()

@auth_router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Dummy authentication for Step 2
    if form_data.username == "admin" and form_data.password == "password123":
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        data = {"sub": form_data.username, "role": "admin"}
        encoded_jwt = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
        return {"access_token": encoded_jwt, "token_type": "bearer"}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

@auth_router.get("/me")
async def get_current_user_info():
    return {"user": "admin", "role": "enterprise-admin", "status": "active"}
