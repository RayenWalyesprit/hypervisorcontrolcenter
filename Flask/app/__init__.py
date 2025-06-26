from flask import Flask
from flask_cors import CORS
from app.routes import register_routes

def create_app():
    app = Flask(__name__)
    app.secret_key = 'supersecretkey'
    CORS(app, supports_credentials=True)
    register_routes(app)
    return app
