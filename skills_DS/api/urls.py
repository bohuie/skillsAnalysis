from django.urls import path 
from . import views

urlpatterns = [
    path('answers', views.AnswersView.as_view()),
    path('fileupload', views.FileUploadView.as_view()),
]
