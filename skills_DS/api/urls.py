from django.urls import path 
from . import views

urlpatterns = [
    path('answers', views.AnswersView.as_view()),
    path('get-jobs', views.GetJobsView.as_view(), name="get_jobs"),
    path('get-skills', views.GetSkillsView.as_view()),
    path('list-skills', views.ListSkillsView.as_view()),
    path('update-skills', views.UpdateSkillsView.as_view())
]