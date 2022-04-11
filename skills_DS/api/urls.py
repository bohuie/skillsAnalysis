from . import views, views_admin
from django.urls import path 
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('answers', views.AnswersView.as_view()),
    path('scrape-jobs', views_admin.ScrapeJobsView.as_view(), name="get_jobs"),
    path('get-skills', views_admin.ExtractSkillsView.as_view()),
    path('list-skills', views_admin.ListSkillsView.as_view()),
    path('update-skills', views_admin.UpdateSkillsView.as_view()),
    path('resume-upload', views.ResumeUploadView.as_view()),
    path('get-profile', views.GetUserProfileView.as_view()),
    path('update-user-skills', views.UpdateUserSkillsView.as_view()),
    path('match-jobs', views.MatchJobsView.as_view())
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
