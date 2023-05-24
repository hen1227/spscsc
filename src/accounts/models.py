from datetime import datetime

from flask_login import UserMixin

from src import bcrypt, db

class User(UserMixin, db.Model):

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    created_on = db.Column(db.DateTime, nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)
    is_confirmed = db.Column(db.Boolean, nullable=False, default=False)
    is_subscribed = db.Column(db.Boolean, nullable=False, default=True)
    confirmed_on = db.Column(db.DateTime, nullable=True)

    def __init__(
        self, email, password, is_admin=False, is_confirmed=False, confirmed_on=None, is_subscribed=True
    ):
        self.email = email
        self.password = bcrypt.generate_password_hash(password)
        self.created_on = datetime.now()
        self.is_admin = is_admin
        self.is_confirmed = is_confirmed
        self.is_subscribed = is_subscribed
        self.confirmed_on = confirmed_on

    def __repr__(self):
        if self.is_admin:
            return f"<admin {self.email}>"
        return f"<email {self.email}>"
