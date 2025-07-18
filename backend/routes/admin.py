from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models import Document, User

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/documents', methods=['GET'])
@jwt_required()
def all_documents():
    user = get_jwt_identity()
    if user['user_type'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    # Filtering logic
    user_name = request.args.get('user_name')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    query = Document.query
    if user_name:
        user_obj = User.query.filter(User.name.ilike(f"%{user_name}%")).all()
        user_ids = [u.id for u in user_obj]
        query = query.filter(Document.user_id.in_(user_ids))
    if start_date:
        try:
            from datetime import datetime
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(Document.upload_datetime >= start_dt)
        except Exception:
            return jsonify({'error': 'Invalid start_date format'}), 400
    if end_date:
        try:
            from datetime import datetime
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(Document.upload_datetime <= end_dt)
        except Exception:
            return jsonify({'error': 'Invalid end_date format'}), 400
    docs = query.all()
    result = []
    for d in docs:
        u = User.query.get(d.user_id)
        result.append({
            'id': d.id,
            'user_name': u.name if u else '',
            'title': d.title,
            'upload_datetime': d.upload_datetime,
            'filename': d.filename,
            'is_viewed': d.is_viewed,
            'admin_comment': d.admin_comment
        })
    return jsonify(result), 200

@admin_bp.route('/documents/<int:doc_id>', methods=['PUT'])
@jwt_required()
def update_document(doc_id):
    user = get_jwt_identity()
    if user['user_type'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    doc = Document.query.get_or_404(doc_id)
    data = request.json
    doc.is_viewed = data.get('is_viewed', doc.is_viewed)
    doc.admin_comment = data.get('admin_comment', doc.admin_comment)
    db.session.commit()
    return jsonify({'message': 'Updated'}), 200
