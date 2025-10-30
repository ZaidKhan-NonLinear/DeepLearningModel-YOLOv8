from django.urls import path
from . import views

app_name = 'detector'

urlpatterns = [
    path('', views.index, name='index'),
    path('predict/', views.predict_image, name='predict'),
    path('model-info/', views.get_model_info, name='model_info'),
    path('history/', views.history, name='history'),
]
