import os
import time
from ultralytics import YOLO
import json


class YOLODetector:
    def __init__(self, model_path="model/best.pt"):
        """
        Initialize the YOLO detector with the trained model.
        
        Args:
            model_path (str): Path to the YOLO model file
        """
        self.model_path = model_path
        self.model = None
        self.model_loaded = False
        self._load_model()
    
    def _load_model(self):
        """Load the YOLO model."""
        try:
            # Check if model file exists
            if not os.path.exists(self.model_path):
                print(f"Model file not found at {self.model_path}")
                print("Attempting to download a pre-trained YOLOv8 model...")
                self._download_pretrained_model()
            
            self.model = YOLO(self.model_path)
            self.model_loaded = True
            print(f"YOLO model loaded successfully from {self.model_path}")
        except Exception as e:
            print(f"Error loading YOLO model: {e}")
            print("Using pre-trained YOLOv8n model as fallback...")
            self._load_fallback_model()
    
    def _download_pretrained_model(self):
        """Download a pre-trained YOLOv8 model."""
        try:
            # Create model directory if it doesn't exist
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            
            # Download YOLOv8n (nano) model as it's small and fast
            print("Downloading YOLOv8n model...")
            model = YOLO('yolov8n.pt')
            model.save(self.model_path)
            print(f"Pre-trained model saved to {self.model_path}")
        except Exception as e:
            print(f"Failed to download pre-trained model: {e}")
            raise e
    
    def _load_fallback_model(self):
        """Load a fallback pre-trained model."""
        try:
            self.model = YOLO('yolov8n.pt')  # Use YOLOv8n as fallback
            self.model_loaded = True
            print("Fallback YOLOv8n model loaded successfully")
        except Exception as e:
            print(f"Failed to load fallback model: {e}")
            self.model_loaded = False
    
    def predict_image(self, image_path):
        """
        Predict objects in an image and return structured results.
        
        Args:
            image_path (str): Path to the image file
            
        Returns:
            dict: Structured prediction results
        """
        if not self.model_loaded:
            return {
                "success": False,
                "error": "YOLO model is not loaded. Please check the model file.",
                "processing_time": 0,
                "image_path": image_path
            }
        
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        start_time = time.time()
        
        try:
            # Run prediction
            results = self.model.predict(source=image_path, save=False, verbose=False)
            
            processing_time = time.time() - start_time
            
            # Extract detection data
            detections = []
            class_counts = {}
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for i in range(len(boxes)):
                        # Get box coordinates
                        box = boxes.xyxy[i].cpu().numpy()  # x1, y1, x2, y2
                        conf = boxes.conf[i].cpu().numpy()
                        cls = int(boxes.cls[i].cpu().numpy())
                        
                        # Get class name
                        class_name = self.model.names[cls]
                        
                        # Calculate width and height
                        x1, y1, x2, y2 = box
                        width = x2 - x1
                        height = y2 - y1
                        
                        detection = {
                            "class_name": class_name,
                            "confidence": float(conf),
                            "bbox": {
                                "x": float(x1),
                                "y": float(y1),
                                "width": float(width),
                                "height": float(height)
                            }
                        }
                        
                        detections.append(detection)
                        
                        # Count objects by class
                        if class_name in class_counts:
                            class_counts[class_name] += 1
                        else:
                            class_counts[class_name] = 1
            
            # Prepare final result
            result_data = {
                "success": True,
                "processing_time": round(processing_time, 3),
                "total_detections": len(detections),
                "detections": detections,
                "class_counts": class_counts,
                "image_path": image_path
            }
            
            return result_data
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time,
                "image_path": image_path
            }
    
    def get_model_info(self):
        """
        Get information about the loaded model.
        
        Returns:
            dict: Model information
        """
        if not self.model_loaded or self.model is None:
            return {
                "error": "Model not loaded",
                "model_loaded": self.model_loaded,
                "model_path": self.model_path
            }
        
        return {
            "model_path": self.model_path,
            "model_names": self.model.names,
            "num_classes": len(self.model.names),
            "model_loaded": self.model_loaded
        }


# Global instance
yolo_detector = YOLODetector()
