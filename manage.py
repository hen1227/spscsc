from flask.cli import FlaskGroup

from src import app, db
from src import app as application
from src.accounts.models import User
from src.core.models import Event

import unittest
import getpass
from datetime import datetime


cli = FlaskGroup(app)

@cli.command("test")
def test():
    """Runs the unit tests without coverage."""
    tests = unittest.TestLoader().discover("tests")
    result = unittest.TextTestRunner(verbosity=2).run(tests)
    if result.wasSuccessful():
        return 0
    else:
        return 1


@cli.command("create_admin")
def create_admin():
    """Creates the admin user."""
    email = input("Enter email address: ")
    password = getpass.getpass("Enter password: ")
    confirm_password = getpass.getpass("Enter password again: ")
    if password != confirm_password:
        print("Passwords don't match")
    else:
        try:
            user = User(
                email=email,
                password=password,
                is_admin=True,
                is_confirmed=True,
                confirmed_on=datetime.now(),
            )
            db.session.add(user)
            db.session.commit()
            print(f"Admin with email {email} created successfully!")
        except Exception:
            print("Couldn't create admin user.")

@cli.command("create_event")
def create_admin():
    """Creates a New Event"""
    title = input("Event Title: ")
    location = input("Location: ")
    date = input("Date MM/DD Day_of_Week: ")
    time = input("Time hh:mm: ")
    time_date = str(date + " at " + time)
    check = input(f"Create {title} event at {location} on {time_date}? (y/n): ")
    if check != "y":
        print("Cancelled Event Creation")
        return
    try:
        event = Event(title=title, location=location, time_date=time_date)
        db.session.add(event)
        db.session.commit()
        print(f"Create {title} event at {location} on {time_date}")
    except Exception:
        print("Couldn't create event!")


if __name__ == "__main__":
    cli()
