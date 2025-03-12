import pytest
import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, db
from models import SavedColor  # Adjust import based on your project structure

@pytest.fixture
def client():
    """Create a test client for the app"""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['WTF_CSRF_ENABLED'] = False
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()

def test_color_converter_page(client):
    """Test that the color converter page loads correctly"""
    response = client.get('/color-converter')
    assert response.status_code == 200
    assert b'Color Converter' in response.data
    assert b'Input Format' in response.data

def test_save_color(client):
    """Test saving a color"""
    # Prepare color data
    color_data = {
        'name': 'Test Color',
        'hex_value': '#4287f5',
        'rgb_value': 'rgb(66, 135, 245)',
        'cmyk_value': 'cmyk(73, 45, 0, 4)'
    }

    # Send POST request to save color
    response = client.post('/save-color', data=color_data, follow_redirects=True)
    
    # Check response
    assert response.status_code == 200
    
    # Check if color was saved in database
    with app.app_context():
        saved_color = SavedColor.query.filter_by(name='Test Color').first()
        assert saved_color is not None
        assert saved_color.hex_value == '#4287f5'
        assert saved_color.rgb_value == 'rgb(66, 135, 245)'
        assert saved_color.cmyk_value == 'cmyk(73, 45, 0, 4)'

def test_delete_color(client):
    """Test deleting a saved color"""
    # First, save a color
    with app.app_context():
        color = SavedColor(
            name='Delete Test Color', 
            hex_value='#ff0000', 
            rgb_value='rgb(255, 0, 0)', 
            cmyk_value='cmyk(0, 100, 100, 0)'
        )
        db.session.add(color)
        db.session.commit()
        color_id = color.id

    # Send DELETE request
    response = client.post(f'/delete-color/{color_id}', follow_redirects=True)
    
    # Check response
    assert response.status_code == 200
    
    # Verify color was deleted
    with app.app_context():
        deleted_color = SavedColor.query.get(color_id)
        assert deleted_color is None

def test_color_conversion_javascript():
    """Verify color conversion logic in JavaScript"""
    # This would typically involve testing the JavaScript directly
    # For now, we'll just check that the script exists
    assert os.path.exists('/home/arthur/CascadeProjects/color-image-utility/static/js/color_converter.js')

def test_color_converter_css():
    """Verify color converter CSS"""
    assert os.path.exists('/home/arthur/CascadeProjects/color-image-utility/static/css/color_converter.css')

if __name__ == '__main__':
    pytest.main([__file__])
