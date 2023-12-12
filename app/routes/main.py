import flask
from flask import Blueprint

main = Blueprint('main', __name__, template_folder='templates', url_prefix="/")


@main.route("/", methods=['GET'])
def main_page():
    if flask.request.method == 'GET':
        return flask.render_template('main.html')


@main.route("/station", methods=['GET'])
def bus_station():
    if flask.request.method == 'GET':
        return flask.render_template('station.html')


@main.route("/route", methods=['GET'])
def route():
    if flask.request.method == 'GET':
        return flask.render_template('route.html')
