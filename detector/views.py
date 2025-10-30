import os
import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from .forms import ImageUploadForm
from .models import DetectionResult
from .ml_model import yolo_detector


def index(request):
    """Main page view."""
    return render(request, 'detector/index.html')


@require_http_methods(["POST"])
def predict_image(request):
    """API endpoint for image prediction."""
    try:
        # Check if image is provided
        if 'image' not in request.FILES:
            return JsonResponse({
                'success': False,
                'error': 'No image file provided'
            }, status=400)
        
        # Validate the uploaded file
        form = ImageUploadForm(request.POST, request.FILES)
        if not form.is_valid():
            return JsonResponse({
                'success': False,
                'error': form.errors['image'][0] if 'image' in form.errors else 'Invalid file'
            }, status=400)
        
        # Get the uploaded image
        uploaded_image = request.FILES['image']
        
        # Save the image temporarily
        file_name = default_storage.save(f'temp/{uploaded_image.name}', ContentFile(uploaded_image.read()))
        file_path = os.path.join(settings.MEDIA_ROOT, file_name)
        
        try:
            # Run prediction
            prediction_result = yolo_detector.predict_image(file_path)
            
            if prediction_result['success']:
                # Save the result to database
                detection_record = DetectionResult.objects.create(
                    image=uploaded_image,
                    detection_results=prediction_result,
                    processing_time=prediction_result.get('processing_time'),
                    total_detections=prediction_result.get('total_detections', 0)
                )
                
                # Prepare response data
                response_data = {
                    'success': True,
                    'detection_id': detection_record.id,
                    'processing_time': prediction_result['processing_time'],
                    'total_detections': prediction_result['total_detections'],
                    'detections': prediction_result['detections'],
                    'class_counts': prediction_result['class_counts']
                }
                
                return JsonResponse(response_data)
            else:
                return JsonResponse({
                    'success': False,
                    'error': prediction_result.get('error', 'Prediction failed')
                }, status=500)
        
        finally:
            # Clean up temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Server error: {str(e)}'
        }, status=500)


def get_model_info(request):
    """Get information about the loaded YOLO model."""
    try:
        model_info = yolo_detector.get_model_info()
        return JsonResponse(model_info)
    except Exception as e:
        return JsonResponse({
            'error': f'Failed to get model info: {str(e)}'
        }, status=500)


def history(request):
    """View detection history."""
    try:
        detections = DetectionResult.objects.all().order_by('-uploaded_at')[:20]  # Last 20 detections
        return render(request, 'detector/history.html', {'detections': detections})
    except Exception as e:
        print(f"Error loading detection history: {e}")
        return render(request, 'detector/history.html', {'detections': []})
