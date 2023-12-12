from flask import Flask

app = Flask(__name__)

from app.routes.main import main
from app.api.main_api import api


app.register_blueprint(main)
app.register_blueprint(api)

