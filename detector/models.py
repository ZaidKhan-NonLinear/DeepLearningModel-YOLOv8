from django.db import models
import json


class DetectionResult(models.Model):
    """Model to store detection results and upload history."""
    
    image = models.ImageField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    detection_results = models.JSONField(default=dict)
    processing_time = models.FloatField(null=True, blank=True)
    total_detections = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Detection Result'
        verbose_name_plural = 'Detection Results'
    
    def __str__(self):
        return f"Detection {self.id} - {self.image.name} ({self.total_detections} objects)"
    
    def get_class_counts(self):
        """Get class counts from detection results."""
        try:
            if self.detection_results and isinstance(self.detection_results, dict) and 'class_counts' in self.detection_results:
                return self.detection_results['class_counts']
        except (TypeError, KeyError, AttributeError) as e:
            print(f"Error getting class counts for detection {self.id}: {e}")
        return {}
    
    def get_detections(self):
        """Get individual detections from results."""
        try:
            if self.detection_results and isinstance(self.detection_results, dict) and 'detections' in self.detection_results:
                return self.detection_results['detections']
        except (TypeError, KeyError, AttributeError) as e:
            print(f"Error getting detections for detection {self.id}: {e}")
        return []
    
    def get_safe_json_data(self):
        """Get detection results as safe JSON string."""
        try:
            if self.detection_results:
                return json.dumps(self.detection_results, ensure_ascii=False)
        except (TypeError, ValueError) as e:
            print(f"Error serializing detection results for detection {self.id}: {e}")
        return '{}'
    
    def get_processing_time_display(self):
        """Get processing time as a safe display value."""
        if self.processing_time is None:
            return 0.0
        return float(self.processing_time)
