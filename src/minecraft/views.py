from flask import Blueprint, render_template
from flask_login import login_required

from src.utils.decorators import check_is_confirmed

minecraft_bp = Blueprint("minecraft", __name__)


@minecraft_bp.route("/minecraft")
@login_required
@check_is_confirmed
def home():
    return render_template("minecraft/index.html")


@minecraft_bp.route("/minecraft/info")
@login_required
@check_is_confirmed
def info():
    return render_template("minecraft/info.html")
