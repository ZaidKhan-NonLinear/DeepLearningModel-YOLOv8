YOLO Object Detection Web Application

A Django-based web application that provides an advanced frontend interface for YOLO object detection. Users can upload images and receive detailed detection results including class names, confidence scores, bounding box coordinates, and visualizations.

Features

- Advanced Upload Interface: Drag-and-drop image upload with preview
- Real-time Analysis: AJAX-based image processing without page reload
- Detailed Results: Comprehensive detection information including:
  - Object class names and confidence scores
  - Bounding box coordinates (x, y, width, height)
  - Object count summary
  - Processing time
- Visualizations: Interactive charts showing class distribution and confidence levels
- History Tracking: View previous detection results
- Responsive Design: Works on desktop and mobile devices
- Modern UI: Bootstrap 5 with custom styling and animations

Requirements

- Python 3.8+
- Django 5.2.7
- Ultralytics YOLO
- PyTorch
- OpenCV
- Pillow
- NumPy
- SciPy
- Matplotlib

Installation

1. Clone or navigate to the project directory:

    cd YOLOProject

2. Activate your virtual environment (if using one):

    # Windows
    YoloEnv\Scripts\activate

    # Linux/Mac
    source YoloEnv/bin/activate

3. Install dependencies:

    pip install -r requirements.txt

4. Run database migrations:

    python manage.py makemigrations
    python manage.py migrate

5. Create a superuser (optional, for admin access):

    python manage.py createsuperuser

Usage

1. Start the development server:

    python manage.py runserver

2. Open your browser and navigate to:

    http://127.0.0.1:8000/

3. Upload an image:
   - Drag and drop an image onto the upload area, or
   - Click "Choose File" to browse for an image
   - Click "Analyze Image" to process the image

4. View results:
   - Detection results will appear below the upload area
   - View detailed statistics and charts
   - Download results as JSON
   - Check detection history

Project Structure

    YOLOProject/
    ├── detector/                 # Django app
    │   ├── static/              # Static files (CSS, JS, images)
    │   │   ├── css/
    │   │   │   └── style.css
    │   │   └── js/
    │   │       └── main.js
    │   ├── templates/           # HTML templates
    │   │   └── detector/
    │   │       ├── base.html
    │   │       ├── index.html
    │   │       └── history.html
    │   ├── models.py            # Database models
    │   ├── views.py             # View functions
    │   ├── forms.py             # Form validation
    │   ├── ml_model.py          # YOLO model wrapper
    │   └── urls.py              # URL patterns
    ├── yolo_project/            # Django project settings
    │   ├── settings.py
    │   └── urls.py
    ├── model/                   # YOLO model files
    │   └── best.pt
    ├── test/                    # Test images
    ├── media/                   # Uploaded files (created automatically)
    ├── requirements.txt         # Python dependencies
    └── manage.py                # Django management script

API Endpoints

- GET / - Main upload page
- POST /predict/ - Image prediction endpoint
- GET /model-info/ - Model information
- GET /history/ - Detection history

Configuration

The application uses the following key settings:

- Media files: Stored in media/ directory
- Static files: Served from detector/static/
- Model path: model/best.pt
- File size limit: 10MB
- Allowed formats: JPG, JPEG, PNG, BMP, TIFF, WEBP

Troubleshooting

1. Model not loading: Ensure model/best.pt exists and is accessible
2. Static files not loading: Run "python manage.py collectstatic"
3. Permission errors: Check file permissions for media directory
4. Memory issues: Reduce image size or increase system memory

Development

To extend the application:

1. Add new detection classes: Modify the YOLO model training
2. Customize UI: Edit templates in detector/templates/
3. Add features: Extend views in detector/views.py
4. Database changes: Create migrations with "python manage.py makemigrations"

License

This project is for educational and research purposes.
