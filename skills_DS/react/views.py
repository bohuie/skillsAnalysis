from django.shortcuts import render, redirect
from base.models import Profile

# Create your views here.

def index(request):
	return render(request, 'react/index.html')

def login_required_view(request):
	if request.user.is_authenticated:
		return render(request, 'react/index.html')
	else:
		return redirect("login")

def word_cloud(request):
	return render(request,'react/index.html')
def profile_required_view(request):
	if request.user.is_authenticated:
		if Profile.objects.filter(user = request.user).exists():
			return render(request, 'react/index.html')
		else:
			return redirect("/questions")
	else:
		return redirect("login")
