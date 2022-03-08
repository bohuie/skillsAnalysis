from . import views

from django.urls import path 
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('answers', views.AnswersView.as_view()),
    path('get-jobs', views.GetJobsView.as_view(), name="get_jobs"),
    path('get-skills', views.GetSkillsView.as_view()),
    path('list-skills', views.ListSkillsView.as_view()),
    path('update-skills', views.UpdateSkillsView.as_view()),
    path('fileupload', views.FileUploadView.as_view()),
    path('get-profile', views.GetUserProfileView.as_view()),
    path('update-user-skills', views.UpdateUserSkillsView.as_view())
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
