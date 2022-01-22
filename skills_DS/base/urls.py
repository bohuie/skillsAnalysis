from pipes import Template
from django.urls import path, include
from . import views
from .admin import custom_admin
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('admin/', custom_admin.urls),
    path('register/', views.register, name="register"),
    path('login/', auth_views.LoginView.as_view(template_name="base/login.html"), name="login"),
    path('logout/', auth_views.LogoutView.as_view(template_name="base/logout.html"), name="logout"),
    path('api/', include('api.urls')),
    path('', include('react.urls'))
]