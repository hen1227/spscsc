from flask import Blueprint, render_template
from flask_login import login_required

from src.utils.decorators import check_is_confirmed

simulations_bp = Blueprint("simulations", __name__)


@simulations_bp.route("/simulations/")
def home():
    return render_template("simulations/index.html")

@simulations_bp.route("/simulations/double_pendulum")
def double_pendulum():
    return render_template("simulations/double_pendulum.html")

@simulations_bp.route("/simulations/color_bounce")
def color_bounce():
    return render_template("simulations/color_bounce.html")

@simulations_bp.route("/simulations/gravity")
def gravity():
    return render_template("simulations/gravity.html")

@simulations_bp.route("/simulations/circular_projectiles")
def circular_projectiles():
    return render_template("simulations/circular_projectiles.html")

@simulations_bp.route("/simulations/pendulum_tunnel")
def pendulum_tunnel():
    return render_template("simulations/pendulum_tunnel.html")

@simulations_bp.route("/simulations/oscillating_charges")
def oscillating_charges():
    return render_template("simulations/oscillating_charges.html")
