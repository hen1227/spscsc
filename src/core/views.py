from flask import Blueprint, render_template, redirect, url_for, flash, request
from src.utils.decorators import check_is_confirmed, admin_required

from src.accounts.models import User
from src.core.models import Event
from src import db
from flask_login import current_user, login_required
from .forms import CreateEventForm

from datetime import datetime

core_bp = Blueprint("core", __name__)


@core_bp.route("/")
def home():
    return render_template("core/index.html")


@core_bp.route("/emails")
@login_required
@check_is_confirmed
def emails():
    return render_template("core/emails.html")

@core_bp.route("/schedule", methods=["GET", "POST"])
def schedule():
    form = CreateEventForm(request.form)
    if form.validate_on_submit() and current_user.is_admin:
        event_datetime = datetime.combine(form.date.data, form.time.data)
        print(f"{current_user} wants to create {form.title.data} at {form.location.data} on {event_datetime}")
        event = Event(title=form.title.data, location=form.location.data, time_date=event_datetime)
        db.session.add(event)
        db.session.commit()
        form.title.data = ""
        form.location.data = ""
        form.date.data = ""
        form.time.data = ""

    events = Event.query.all()
    return render_template("core/schedule.html", events=events, form=form)

@core_bp.route("/rsvp/<int:event_id>/<response>")
@login_required
@check_is_confirmed
def rsvp(event_id=-1, response="blank"):
    print(f"{current_user} responded {response} to event {event_id}")
    return redirect(url_for('core.schedule'))

@core_bp.route("/delete_event/<int:event_id>")
@login_required
@admin_required
@check_is_confirmed
def delete_event(event_id=-1):
    print(f"{current_user} wants to delete {event_id}")
    Event.query.filter(Event.id == event_id).delete()
    db.session.commit()
    return redirect(url_for('core.schedule'))

@core_bp.route("/delete_user/<int:user_id>")
@login_required
@admin_required
@check_is_confirmed
def delete_user(user_id=-1):
    print(f"{current_user} wants to delete {user_id}")
    User.query.filter(User.id == user_id).delete()
    db.session.commit()
    return redirect(url_for('core.admin'))

@core_bp.route("/admin")
@login_required
@admin_required
@check_is_confirmed
def admin():
    return render_template("core/admin.html", users=User.query.all())
