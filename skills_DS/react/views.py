from django.shortcuts import render, redirect

# Create your views here.

def index(request):
	return render(request, 'react/index.html')


def login_required(request):
	if request.user.is_authenticated:
		return render(request, 'react/index.html')
	else:
		return redirect("login")

def word_cloud(request):
	return render(request,'react/index.html')