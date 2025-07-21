from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app import db
from models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('user_type', 'user')
    if user_type == 'admin':
        return jsonify({'error': 'Admin signup is not allowed'}), 403
    if not all([name, email, password]):
        return jsonify({'error': 'Missing fields'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409
    hashed_password = generate_password_hash(password)
    user = User(name=name, email=email, hashed_password=hashed_password, user_type=user_type)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Signup successful'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    print("--- Login attempt received ---")
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        user_type = data.get('user_type', 'user')
        print(f"Attempting login for email: {email}, user_type: {user_type}")

        if user_type == 'admin':
            if email != 'admin@docky.com':
                print("Admin login attempt for non-admin email. Denying.")
                return jsonify({'error': 'Unauthorized admin login'}), 403
        
        user = User.query.filter_by(email=email, user_type=user_type).first()
        
        if not user:
            print(f"User '{email}' not found in database. Denying.")
            return jsonify({'error': 'Invalid credentials - user not found'}), 401

        print(f"User '{email}' found. Checking password.")
        if not check_password_hash(user.hashed_password, password):
            print(f"Password for user '{email}' does not match. Denying.")
            return jsonify({'error': 'Invalid credentials - password mismatch'}), 401
        
        print(f"Login successful for user '{email}'. Generating token.")
        token = create_access_token(identity={'id': user.id, 'user_type': user.user_type})
        response_data = {'token': token, 'user_type': user.user_type, 'name': user.name}
        print(f"Returning token for user '{email}'.")
        return jsonify(response_data), 200
    except Exception as e:
        print(f"!!! An unexpected error occurred in login function: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'A server error occurred'}), 500
