from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from flask_caching import Cache
import os
from datetime import datetime
from PIL import Image
import io
import json
import uuid
from models import db, SavedColor

# Initialize Flask app with performance configs
app = Flask(__name__)
app.config.update(
    SECRET_KEY=os.urandom(24),
    SQLALCHEMY_DATABASE_URI='sqlite:///colors_images.db',
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    UPLOAD_FOLDER='static/uploads',
    MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # 16MB max upload
    CACHE_TYPE='simple',  # Use in-memory caching
    CACHE_DEFAULT_TIMEOUT=300  # 5 minutes cache
)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
db.init_app(app)
cache = Cache(app)

# Add context processor for current year
@app.context_processor
def inject_current_year():
    from datetime import datetime
    return dict(now=datetime.now())

# Models
class ImageConversion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    original_filename = db.Column(db.String(100), nullable=False)
    converted_filename = db.Column(db.String(100), nullable=False)
    original_format = db.Column(db.String(10), nullable=False)
    converted_format = db.Column(db.String(10), nullable=False)
    date_converted = db.Column(db.DateTime, default=datetime.utcnow)

# Color conversion functions
def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(rgb_color):
    return '#{:02x}{:02x}{:02x}'.format(rgb_color[0], rgb_color[1], rgb_color[2])

def rgb_to_cmyk(rgb_color):
    r, g, b = [x / 255.0 for x in rgb_color]
    k = 1 - max(r, g, b)
    
    if k == 1:
        return (0, 0, 0, 100)
    
    c = (1 - r - k) / (1 - k) * 100
    m = (1 - g - k) / (1 - k) * 100
    y = (1 - b - k) / (1 - k) * 100
    k = k * 100
    
    return (round(c), round(m), round(y), round(k))

def cmyk_to_rgb(cmyk_color):
    c, m, y, k = [x / 100.0 for x in cmyk_color]
    
    r = round(255 * (1 - c) * (1 - k))
    g = round(255 * (1 - m) * (1 - k))
    b = round(255 * (1 - y) * (1 - k))
    
    return (r, g, b)

# Optimized routes with caching and better error handling
@app.route('/')
@cache.cached(timeout=300)
def index():
    return render_template('index.html')

@app.route('/color-converter')
@cache.cached(timeout=300)
def color_converter():
    """Render the color converter page with saved colors"""
    saved_colors = SavedColor.query.order_by(SavedColor.created_at.desc()).all()
    return render_template('color_converter.html', saved_colors=saved_colors)

@app.route('/convert-color', methods=['POST'])
def convert_color():
    color_input = request.form.get('color_input', '')
    input_type = request.form.get('input_type', '')
    
    try:
        if input_type == 'hex':
            hex_value = color_input
            rgb_value = hex_to_rgb(hex_value)
            cmyk_value = rgb_to_cmyk(rgb_value)
        elif input_type == 'rgb':
            # Parse RGB input (format: r,g,b)
            rgb_parts = color_input.replace('(', '').replace(')', '').split(',')
            rgb_value = tuple(int(part.strip()) for part in rgb_parts)
            hex_value = rgb_to_hex(rgb_value)
            cmyk_value = rgb_to_cmyk(rgb_value)
        elif input_type == 'cmyk':
            # Parse CMYK input (format: c,m,y,k)
            cmyk_parts = color_input.replace('(', '').replace(')', '').split(',')
            cmyk_value = tuple(int(part.strip()) for part in cmyk_parts)
            rgb_value = cmyk_to_rgb(cmyk_value)
            hex_value = rgb_to_hex(rgb_value)
        else:
            return jsonify({'error': 'Invalid input type'})
        
        return jsonify({
            'hex': hex_value,
            'rgb': f'rgb({rgb_value[0]}, {rgb_value[1]}, {rgb_value[2]})',
            'cmyk': f'cmyk({cmyk_value[0]}, {cmyk_value[1]}, {cmyk_value[2]}, {cmyk_value[3]})'
        })
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/save-color', methods=['POST'])
def save_color():
    """Save a color to the database"""
    try:
        name = request.form.get('name', 'Unnamed Color')
        hex_value = request.form.get('hex_value', '')
        rgb_value = request.form.get('rgb_value', '')
        cmyk_value = request.form.get('cmyk_value', '')

        # Check if a color with the same name already exists
        existing_color = SavedColor.query.filter_by(name=name).first()
        if existing_color:
            flash('A color with this name already exists.', 'warning')
            return redirect(url_for('color_converter'))

        # Create and save new color
        new_color = SavedColor(
            name=name, 
            hex_value=hex_value, 
            rgb_value=rgb_value, 
            cmyk_value=cmyk_value
        )
        db.session.add(new_color)
        db.session.commit()

        flash('Color saved successfully!', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error saving color: {str(e)}', 'error')
    
    return redirect(url_for('color_converter'))

@app.route('/delete-color/<int:color_id>', methods=['POST'])
def delete_color(color_id):
    """Delete a saved color"""
    try:
        color = SavedColor.query.get_or_404(color_id)
        db.session.delete(color)
        db.session.commit()
        flash('Color deleted successfully!', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error deleting color: {str(e)}', 'error')
    
    return redirect(url_for('color_converter'))

@app.route('/image-converter')
@cache.cached(timeout=300)
def image_converter():
    try:
        conversions = ImageConversion.query.order_by(ImageConversion.date_converted.desc()).limit(50).all()
        return render_template('image_converter.html', conversions=conversions)
    except Exception as e:
        flash(f'Error retrieving conversions: {str(e)}', 'error')
        return render_template('image_converter.html', conversions=[])

@app.route('/convert-image', methods=['POST'])
def convert_image():
    if 'image' not in request.files:
        flash('No file uploaded', 'error')
        return redirect(url_for('image_converter'))
    
    file = request.files['image']
    if file.filename == '':
        flash('No selected file', 'error')
        return redirect(url_for('image_converter'))
    
    target_format = request.form.get('target_format', 'png').lower()
    
    try:
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
        original_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(original_path)
        
        # Optimize image conversion
        img = Image.open(original_path)
        img = img.convert('RGB')  # Standardize image mode
        
        converted_filename = f"{uuid.uuid4()}.{target_format}"
        converted_path = os.path.join(app.config['UPLOAD_FOLDER'], converted_filename)
        
        # High-quality conversion with compression
        img.save(converted_path, target_format.upper(), optimize=True, quality=85)
        
        # Clean up original file
        os.remove(original_path)
        
        # Save conversion record
        conversion = ImageConversion(
            original_filename=unique_filename,
            converted_filename=converted_filename,
            original_format=img.format,
            converted_format=target_format
        )
        db.session.add(conversion)
        db.session.commit()
        
        flash('Image converted successfully!', 'success')
        return redirect(url_for('image_converter'))
    
    except Exception as e:
        flash(f'Conversion error: {str(e)}', 'error')
        return redirect(url_for('image_converter'))

@app.route('/delete-conversion/<int:conversion_id>', methods=['POST'])
def delete_conversion(conversion_id):
    conversion = ImageConversion.query.get_or_404(conversion_id)
    
    # Delete files if they exist
    original_path = os.path.join(app.config['UPLOAD_FOLDER'], conversion.original_filename)
    converted_path = os.path.join(app.config['UPLOAD_FOLDER'], conversion.converted_filename)
    
    if os.path.exists(original_path):
        os.remove(original_path)
    
    if os.path.exists(converted_path):
        os.remove(converted_path)
    
    # Delete record
    db.session.delete(conversion)
    db.session.commit()
    
    flash('Conversion record deleted successfully!', 'success')
    return redirect(url_for('image_converter'))

# Add route for serving converted images
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Initialize database
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
