from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

app = Flask(__name__)
database_url = os.environ.get('DATABASE_URL')

if database_url:
    # Use the Render PostgreSQL database
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    # Fallback to local SQLite database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///docky.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # This will be overridden by the environment variable on Render
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')

CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Register blueprints
from routes.auth import auth_bp
from routes.documents import documents_bp
from routes.admin import admin_bp
from routes.settings import settings_bp
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(documents_bp, url_prefix='/api/documents')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(settings_bp, url_prefix='/api/settings')

# Create tables if not exist
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True) 
    
