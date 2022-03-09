from django.urls import re_path, path
from . import views

urlpatterns = [
    path("upload", views.login_required),
    path("profile", views.login_required, name="user_profile"),
    re_path(r"^.*", views.index) 
]