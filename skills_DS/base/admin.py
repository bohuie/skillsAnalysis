from django.contrib import admin

# Register your models here.

from .models import User

class CustomUserAdmin(admin.ModelAdmin):
	pass
admin.site.register(User, CustomUserAdmin)