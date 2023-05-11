from flask import Flask, render_template, request, redirect, url_for, flash
from mcrcon import MCRcon
from urllib.request import urlopen 
import os
from dotenv import load_dotenv
import json
# from flask_mail import Mail, Message

from email_list import save_email_to_file, remove_email_from_file


app = Flask(__name__)
load_dotenv()
# dotenv SECRET_KEY=SomeRandomKey 
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

@app.route('/') # [...]
def index():
   return render_template("index.html")

@app.route('/simulations')
def simulations():
   return render_template("simulations/index.html")

@app.route('/simulations/bounce')
def bounce():
   return render_template("/simulations/bounce/index.html")

@app.route('/simulations/double-pendulum')
def double_pendulum():
   return render_template("/simulations/double_pendulum/index.html")

@app.route('/simulations/circular-projectiles')
def circular_projectiles():
   return render_template("/simulations/circular_projectiles/index.html")

@app.route('/simulations/gravity')
def gravity():
   return render_template("/simulations/gravity/index.html")

@app.route('/simulations/pendulum-tunnel')
def pendulum_tunnel():
   return render_template("/simulations/pendulum_tunnel/index.html")



def send_command(command):
    with MCRcon("localhost", os.getenv('RCON_KEY'), 25575) as mcr:
        response = mcr.command(command)
    return response

@app.route('/minecraft/whitelist', methods=['GET', 'POST'])
def whitelist():
    if request.method == 'POST':
        username = request.form['username']
        send_command(f'whitelist add {username}')
        return redirect(url_for('whitelist'))
    return render_template('minecraft/whitelist.html')

@app.route('/minecraft/chat', methods=['GET', 'POST'])
def chat():
    if request.method == 'POST':
        message = request.form['message']
        send_command(f'say {message}')
        return redirect(url_for('chat'))
    chat_messages = send_command('list').splitlines()[-10:]
    return render_template('minecraft/chat.html', chat_messages=chat_messages)


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email_address = request.form['email']
        action = request.form['action']

        if action == 'subscribe':
            try:
                if save_email_to_file(email_address):
                    flash('Email "' + email_address + '" added successfully', 'success')
                else:
                    flash('Email "' + email_address + '" already in the list', 'warning')
            except:
                flash('Error: Unable to save email', 'danger')
        elif action == 'unsubscribe':
            try:
                if remove_email_from_file(email_address):
                    flash('Email "' + email_address + '" removed successfully', 'success')
                else:
                    flash('Email "' + email_address + '" not found in the list', 'warning')
            except:
                flash('Error: Unable to remove email', 'danger')

        return redirect(url_for('signup'))
    return render_template('signup.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)

# mail = Mail(app) # instantiate the mail class
   
# # configuration of mail
# app.config['MAIL_SERVER']='smtp.gmail.com'
# app.config['MAIL_PORT'] = 465
# app.config['MAIL_USERNAME'] = 'yourId@gmail.com'
# app.config['MAIL_PASSWORD'] = '*****'
# app.config['MAIL_USE_TLS'] = False
# app.config['MAIL_USE_SSL'] = True
# mail = Mail(app)
   
# # message object mapped to a particular URL ‘/’
# @app.route("/")
# def index():
#    msg = Message(
#                 'Hello',
#                 sender ='yourId@gmail.com',
#                 recipients = ['receiver’sid@gmail.com']
#                )
#    msg.body = 'Hello Flask message sent from Flask-Mail'
#    mail.send(msg)
#    return 'Sent'