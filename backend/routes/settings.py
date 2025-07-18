from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models import Settings
from datetime import datetime

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/deadline', methods=['GET'])
@jwt_required()
def get_deadline():
    user = get_jwt_identity()
    if not user or 'id' not in user:
        return jsonify({'error': 'Invalid or missing token'}), 401
    try:
        s = Settings.query.first()
        return jsonify({'deadline_datetime': s.deadline_datetime if s else None}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch deadline', 'details': str(e)}), 400

@settings_bp.route('/deadline', methods=['POST'])
@jwt_required()
def set_deadline():
    user = get_jwt_identity()
    if user['user_type'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.json
    deadline = data.get('deadline_datetime')
    try:
        deadline_dt = datetime.fromisoformat(deadline)
    except Exception:
        return jsonify({'error': 'Invalid datetime format'}), 400
    s = Settings.query.first()
    if not s:
        s = Settings(deadline_datetime=deadline_dt)
        db.session.add(s)
    else:
        s.deadline_datetime = deadline_dt
    db.session.commit()
    return jsonify({'message': 'Deadline set'}), 200
