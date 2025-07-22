from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

from flask import send_from_directory
app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")
database_url = os.environ.get('DATABASE_URL')

if database_url:
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///docky.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key'
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

# The temporary seed route has been removed for security.

# Create tables if not exist
with app.app_context():
    db.create_all()



# Serve favicon.ico from React build or public directory
@app.route('/favicon.ico')
def favicon():
    # Try build directory first, fallback to public if needed
    build_favicon = os.path.join(app.static_folder, 'favicon.ico')
    public_favicon = os.path.join(os.path.dirname(app.static_folder), 'public', 'favicon.ico')
    if os.path.exists(build_favicon):
        return send_from_directory(app.static_folder, 'favicon.ico')
    elif os.path.exists(public_favicon):
        return send_from_directory(os.path.join(os.path.dirname(app.static_folder), 'public'), 'favicon.ico')
    else:
        # No favicon found
        from flask import abort
        return abort(404)

# Serve React build files for non-API routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
    
