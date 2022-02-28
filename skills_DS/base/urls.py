from django.urls import path, include
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('register/', views.register, name="register"),
    path('profile/', views.user_profile, name="user_profile"),
    path('login/', views._login, name="login"),
    path('login-redirect/', views.login_redirect, name="login_redirect"),
    path('logout/', auth_views.LogoutView.as_view(template_name="base/logout.html"), name="logout"),
    path('password_reset/', auth_views.PasswordResetView.as_view(template_name="base/password_reset.html"), name="password_reset"),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(template_name="base/password_reset_done.html"), name="password_reset_done"),
    path('password_reset_confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name="base/password_reset_confirm.html"), name="password_reset_confirm"),
    path('password_reset_complete/', auth_views.PasswordResetCompleteView.as_view(template_name="base/password_reset_complete.html"), name="password_reset_complete"),
    path('activate/<uidb64>/<token>', views.VerificationView.as_view(), name="activate"),
    path('api/', include('api.urls')),
    path('', include('react.urls'))
]