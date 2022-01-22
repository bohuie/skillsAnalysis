from django.apps import AppConfig
from django.contrib.admin.apps import AdminConfig


class BaseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'base'


class CustomAdminConfig(AdminConfig):
    default_site = "base.admin.CustomAdminSite"