from django.urls import path 
from . import views

urlpatterns = [
    path('answers', views.AnswersView.as_view()),
    path('get-jobs', views.GetJobsView.as_view(), name="get_jobs")
]