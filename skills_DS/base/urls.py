from django.urls import path, include
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('register/', views.register, name="register"),
    path('profile/', views.user_profile, name="user_profile"),
    path('login/', views.MyLoginView.as_view(template_name="base/login.html"), name="login"),
    path('logout/', auth_views.LogoutView.as_view(template_name="base/logout.html"), name="logout"),
    path('password_reset/', auth_views.PasswordResetView.as_view(template_name="base/password_reset.html"), name="password_reset"),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(template_name="base/password_reset_done.html"), name="password_reset_done"),
    path('password_reset_confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name="base/password_reset_confirm.html"), name="password_reset_confirm"),
    path('password_reset_complete/', auth_views.PasswordResetCompleteView.as_view(template_name="base/password_reset_complete.html"), name="password_reset_complete"),
    path('api/', include('api.urls')),
    path('', include('react.urls'))
]