from flask import Flask
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.static_folder = 'static'
    from app import routes
    app.register_blueprint(routes.main)
    return app
