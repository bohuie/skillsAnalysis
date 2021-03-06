from importlib.resources import path
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.shortcuts import render, redirect
from .models import User, Profile
from api.models import Location, JobPosting, JobTitle, Skill, InvalidSkill

# Register your models here.


class CustomUserAdmin(admin.ModelAdmin):
	pass

class CustomAdminSite(admin.AdminSite):
	def get_urls(self):
		return [
    		path('skills/', self.admin_view(self.skills_view)),
			path('browse-skills/', self.admin_view(self.skills_view)),
			path('skills-gender/', self.admin_view(self.skills_view)),
			path('skills-year/', self.admin_view(self.skills_view))
		] + super().get_urls()
	
	def skills_view(self, request):
		return render(request, 'base/admin_base.html')

custom_admin = CustomAdminSite()
custom_admin.register(User, CustomUserAdmin)
custom_admin.register(JobPosting, CustomUserAdmin)
custom_admin.register(Location, CustomUserAdmin)
custom_admin.register(JobTitle, CustomUserAdmin)
custom_admin.register(Skill, CustomUserAdmin)
custom_admin.register(Profile, CustomUserAdmin)

