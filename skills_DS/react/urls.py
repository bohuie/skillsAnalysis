from django.urls import re_path, path
from . import views

urlpatterns = [
    path("upload", views.login_required),
    re_path(r"^.*", views.index) 
]