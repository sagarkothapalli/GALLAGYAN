from peewee import *
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher
import os
import json
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

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


class RefreshToken(BaseModel):
    """Stores refresh tokens for token rotation and revocation."""
    user = ForeignKeyField(User, backref='refresh_tokens')
    token_hash = CharField(unique=True)   # SHA-256 hash of the refresh token
    expires_at = DateTimeField()
    revoked = BooleanField(default=False)
    created_at = DateTimeField(constraints=[SQL('DEFAULT CURRENT_TIMESTAMP')])


def init_db():
    logger.info("Initializing database...")
    db.connect()
    logger.info("Connected to database.")
    db.create_tables([User, UserData, RefreshToken])
    logger.info("Tables created.")

    # Default user — password from environment variable, never hardcoded
    default_passcode = os.getenv("DEFAULT_USER_PASSCODE")
    if default_passcode:
        logger.info("Processing default user...")
        if len(default_passcode) < 8:
            logger.warning("DEFAULT_USER_PASSCODE is too short (min 8 chars). Skipping default user creation.")
        else:
            hashed = password_hash.hash(default_passcode[:72])
            logger.info("Passcode hashed.")

            user, created = User.get_or_create(
                username='sagar',
                defaults={'passcode': hashed}
            )
            logger.info(f"User 'sagar' {'created' if created else 'already exists'}.")
            # Only update password on first creation, not every restart
            if created:
                logger.info("Default user 'sagar' created.")
                UserData.get_or_create(user=user)
            elif not UserData.select().where(UserData.user == user).exists():
                UserData.get_or_create(user=user)
    else:
        logger.info("No DEFAULT_USER_PASSCODE set; skipping default user creation.")

    db.close()
    logger.info("Database connection closed.")


if __name__ == "__main__":
    init_db()
