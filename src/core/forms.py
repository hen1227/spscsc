from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.fields.datetime import DateField, TimeField
from wtforms.validators import DataRequired

# from src.accounts.models import User


class CreateEventForm(FlaskForm):
    title = StringField("Event Title", validators=[DataRequired()])
    location = StringField("Location", validators=[DataRequired()])
    date = DateField('Event Date', format='%Y-%m-%d', validators=[DataRequired()])
    time = TimeField('Event Time', validators=[DataRequired()])