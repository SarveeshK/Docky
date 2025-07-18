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
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('user_type', 'user')
    # Only allow admin login for a specific email
    if user_type == 'admin':
        if email != 'admin@docky.com':
            return jsonify({'error': 'Unauthorized admin login'}), 403
    user = User.query.filter_by(email=email, user_type=user_type).first()
    if not user or not check_password_hash(user.hashed_password, password):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = create_access_token(identity={'id': user.id, 'user_type': user.user_type})
    return jsonify({'token': token, 'user_type': user.user_type, 'name': user.name}), 200
