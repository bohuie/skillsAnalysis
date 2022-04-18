from django.urls import re_path
from . import views

urlpatterns = [
    re_path(r"^upload\/?$", views.login_required_view, name="resume_upload"),
    re_path(r"^profile\/?$", views.profile_required_view, name="user_profile"),
    re_path(r"^word-cloud\/?$", views.word_cloud),
    re_path(r"^view-skills\/?$", views.word_cloud),
    re_path(r"^.*", views.index) 
]