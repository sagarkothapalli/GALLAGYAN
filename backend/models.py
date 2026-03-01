from peewee import *
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher
import os
import json

# Database file location
db_path = os.path.join(os.path.dirname(__file__), "gallagyan.db")
db = SqliteDatabase(db_path)

password_hash = PasswordHash((BcryptHasher(),))


class BaseModel(Model):
    class Meta:
        database = db


class User(BaseModel):
    username = CharField(unique=True)
    passcode = CharField()  # pwdlib hashed
    created_at = DateTimeField(constraints=[SQL('DEFAULT CURRENT_TIMESTAMP')])


class UserData(BaseModel):
    user = ForeignKeyField(User, backref='data', unique=True)
    portfolio = TextField(default='[]')   # JSON string of portfolio items
    watchlist = TextField(default='[]')   # JSON string of watchlist items
    alerts = TextField(default='[]')      # JSON string of alert items


def init_db():
    print("INITIALIZING DATABASE...")
    db.connect()
    db.create_tables([User, UserData])

    # Default user for the dashboard
    default_passcode = "anand"
    hashed = password_hash.hash(default_passcode)

    user, created = User.get_or_create(
        username='sagar',
        defaults={'passcode': hashed}
    )
    if not created:
        user.passcode = hashed
        user.save()
    
    if created or not UserData.select().where(UserData.user == user).exists():
        UserData.get_or_create(user=user)

    db.close()


if __name__ == "__main__":
    init_db()
