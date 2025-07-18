import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import db
from models import User, Document, Settings
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

def seed():
    from app import app
    with app.app_context():
        db.drop_all()
        db.create_all()
        # Create admin
        admin = User(name='Admin', email='admin@docky.com', hashed_password=generate_password_hash('admin123'), user_type='admin')
        db.session.add(admin)
        # Create users
        user1 = User(name='Alice', email='alice@docky.com', hashed_password=generate_password_hash('alice123'), user_type='user')
        user2 = User(name='Bob', email='bob@docky.com', hashed_password=generate_password_hash('bob123'), user_type='user')
        db.session.add(user1)
        db.session.add(user2)
        # Create settings
        deadline = datetime.utcnow() + timedelta(days=2)
        settings = Settings(deadline_datetime=deadline)
        db.session.add(settings)
        db.session.commit()
        # Create documents
        doc1 = Document(user_id=user1.id, title='Alice Doc', description='First doc', filename='alice_doc.pdf', is_viewed=False)
        doc2 = Document(user_id=user2.id, title='Bob Doc', description='Second doc', filename='bob_doc.pdf', is_viewed=True, admin_comment='Reviewed')
        db.session.add(doc1)
        db.session.add(doc2)
        db.session.commit()

if __name__ == '__main__':
    seed()
    print('Seeded test data.')
