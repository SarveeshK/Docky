from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

app = Flask(__name__)
database_url = os.environ.get('DATABASE_URL')

if database_url:
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///docky.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-key')
app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER', os.path.join(os.path.dirname(__file__), 'uploads'))

# Use environment variable for CORS origins for flexibility on Render
CORS(app, origins=["https://docky-1.onrender.com"])

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

# The temporary seed route has been removed for security.

# Create tables if not exist
with app.app_context():
    db.create_all()

# Temporary route to create admin user (REMOVE after use)
@app.route('/create_admin')
def create_admin():
    from models import db, User
    from werkzeug.security import generate_password_hash
    if not User.query.filter_by(email="admin@docky.com").first():
        admin = User(
            name="Admin",
            email="admin@docky.com",
            hashed_password=generate_password_hash("admin123"),
            user_type="admin"
        )
        db.session.add(admin)
        db.session.commit()
        return "Admin created!"
    return "Admin already exists."

if __name__ == '__main__':
    app.run(debug=True)
    
