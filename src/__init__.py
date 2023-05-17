from decouple import config
from flask import Flask, render_template
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()
# dotenv SECRET_KEY=SomeRandomKey 
app.config.from_object(config("APP_SETTINGS"))
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# app.config.from_object()
login_manager = LoginManager()
login_manager.init_app(app)
bcrypt = Bcrypt(app)
mail = Mail(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Registering blueprints
from src.accounts.views import accounts_bp
from src.core.views import core_bp
from src.minecraft.views import minecraft_bp
from src.simulations.views import simulations_bp

app.register_blueprint(accounts_bp)
app.register_blueprint(core_bp)
app.register_blueprint(minecraft_bp)
app.register_blueprint(simulations_bp)

from .accounts.models import User
from .core.models import Event

login_manager.login_view = "accounts.login"
login_manager.login_message_category = "danger"


@login_manager.user_loader
def load_user(user_id):
    return User.query.filter(User.id == int(user_id)).first()


########################
#### error handlers ####
########################


@app.errorhandler(401)
def unauthorized_page(error):
    return render_template("errors/401.html"), 401


@app.errorhandler(404)
def page_not_found(error):
    return render_template("errors/404.html"), 404


@app.errorhandler(500)
def server_error_page(error):
    return render_template("errors/500.html"), 500
