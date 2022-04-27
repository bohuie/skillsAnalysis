from . import views
from .admin import custom_admin

from django.urls import re_path, path, include
from django.contrib.auth import views as auth_views

urlpatterns = [
    path("admin/", custom_admin.urls),
    re_path(r"^register\/?$", views.register, name="register"),
    re_path(r"^login\/?$", views._login, name="login"),
    re_path(r"^login-redirect\/?$", views.login_redirect, name="login_redirect"),
    re_path(r"^logout\/?$", auth_views.LogoutView.as_view(template_name="base/logout.html"), name="logout"),
    re_path(r"^password_reset\/?$", auth_views.PasswordResetView.as_view(template_name="base/password_reset.html"), name="password_reset"),
    re_path(r"^password_reset/done\/?$", auth_views.PasswordResetDoneView.as_view(template_name="base/password_reset_done.html"), name="password_reset_done"),
    path('password_reset_confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name="base/password_reset_confirm.html"), name="password_reset_confirm"),
    re_path(r"^password_reset_complete\/?$", auth_views.PasswordResetCompleteView.as_view(template_name="base/password_reset_complete.html"), name="password_reset_complete"),
    path('activate/<uidb64>/<token>', views.VerificationView.as_view(), name="activate"),
    path("api/", include('api.urls')),
    path('', include('react.urls'))
]