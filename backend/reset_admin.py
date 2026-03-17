from database import SessionLocal, init_db
import models
from auth.security import get_password_hash

def fix_admin():
    init_db()
    db = SessionLocal()
    u = db.query(models.User).filter(models.User.username == 'admin').first()
    if not u:
        print("Creating admin user...")
        u = models.User(username='admin')
        db.add(u)
    
    print("Setting admin password to password123...")
    u.hashed_password = get_password_hash('password123')
    db.commit()
    db.close()
    print("Success!")

if __name__ == "__main__":
    fix_admin()
