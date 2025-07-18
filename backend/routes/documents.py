from flask import Blueprint, request, jsonify, send_from_directory, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db, app
from models import Document, User, Settings
import os
from datetime import datetime

documents_bp = Blueprint('documents', __name__)


@documents_bp.route('/upload', methods=['OPTIONS', 'POST'])
@jwt_required()
def upload_document():
    if request.method == 'OPTIONS':
        # CORS preflight
        return '', 204
    user = get_jwt_identity()
    if not user or 'id' not in user:
        return jsonify({'error': 'Invalid or missing token'}), 401
    user_id = user['id']
    title = request.form.get('title')
    description = request.form.get('description')
    file = request.files.get('file')
    if not all([title, file]):
        return jsonify({'error': 'Missing fields'}), 400
    # Check deadline
    settings = Settings.query.first()
    if settings and settings.deadline_datetime and datetime.utcnow() > settings.deadline_datetime:
        return jsonify({'error': 'Deadline passed'}), 403
    filename = f"{user_id}_{int(datetime.utcnow().timestamp())}_{file.filename}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    doc = Document(user_id=user_id, title=title, description=description, filename=filename)
    db.session.add(doc)
    db.session.commit()
    return jsonify({'message': 'Upload successful'}), 201

@documents_bp.route('/my', methods=['GET'])
@jwt_required()
def my_documents():
    user = get_jwt_identity()
    if not user or 'id' not in user:
        return jsonify({'error': 'Invalid or missing token'}), 401
    try:
        docs = Document.query.filter_by(user_id=user['id']).all()
        result = []
        for d in docs:
            result.append({
                'id': d.id,
                'title': d.title,
                'upload_datetime': d.upload_datetime,
                'is_viewed': d.is_viewed,
                'admin_comment': d.admin_comment,
                'filename': d.filename
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch documents', 'details': str(e)}), 400

@documents_bp.route('/download/<int:doc_id>', methods=['GET'])
@jwt_required()
def download_document(doc_id):
    user = get_jwt_identity()
    doc = Document.query.get_or_404(doc_id)
    if doc.user_id != user['id']:
        return jsonify({'error': 'Unauthorized'}), 403
    return send_from_directory(app.config['UPLOAD_FOLDER'], doc.filename, as_attachment=True)

@documents_bp.route('/view/<int:doc_id>', methods=['GET'])
@jwt_required()
def view_document(doc_id):
    user = get_jwt_identity()
    from mimetypes import guess_type
    doc = Document.query.get_or_404(doc_id)
    # Allow admin to view any file, user only their own
    if user['user_type'] != 'admin' and doc.user_id != user['id']:
        return jsonify({'error': 'Unauthorized'}), 403
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], doc.filename)
    mimetype, _ = guess_type(filepath)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    return send_file(filepath, mimetype=mimetype or 'application/octet-stream')

@documents_bp.route('/debug-list', methods=['GET'])
def debug_list_documents():
    from models import Document
    docs = Document.query.all()
    return jsonify([
        {'id': d.id, 'filename': d.filename, 'title': d.title, 'user_id': d.user_id}
        for d in docs
    ])
