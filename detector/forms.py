from django import forms
from django.core.exceptions import ValidationError
import os


class ImageUploadForm(forms.Form):
    """Form for image upload with validation."""
    
    image = forms.ImageField(
        label='Upload Image',
        help_text='Select an image file to analyze',
        widget=forms.FileInput(attrs={
            'class': 'form-control',
            'accept': 'image/*',
            'id': 'imageInput'
        })
    )
    
    def clean_image(self):
        """Validate the uploaded image."""
        image = self.cleaned_data.get('image')
        
        if not image:
            raise ValidationError('Please select an image file.')
        
        # Check file size (limit to 10MB)
        if image.size > 10 * 1024 * 1024:
            raise ValidationError('Image file too large. Maximum size is 10MB.')
        
        # Check file extension
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp']
        file_extension = os.path.splitext(image.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise ValidationError(
                f'Invalid file type. Allowed types: {", ".join(allowed_extensions)}'
            )
        
        return image
