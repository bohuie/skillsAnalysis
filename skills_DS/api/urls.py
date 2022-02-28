from django.urls import path 
from . import views

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('answers', views.AnswersView.as_view()),
    path('fileupload', views.FileUploadView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)