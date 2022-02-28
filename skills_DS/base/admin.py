from django.contrib import admin

# Register your models here.

from .models import User ,Profile

@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
	pass

admin.site.register(Profile)