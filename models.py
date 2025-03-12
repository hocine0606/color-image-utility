from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()

class SavedColor(db.Model):
    """Model for saving user's favorite colors"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    hex_value = db.Column(db.String(7), nullable=False)
    rgb_value = db.Column(db.String(50), nullable=False)
    cmyk_value = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<SavedColor {self.name}: {self.hex_value}>'

    def to_dict(self):
        """Convert model to dictionary for easy serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'hex_value': self.hex_value,
            'rgb_value': self.rgb_value,
            'cmyk_value': self.cmyk_value,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
