from django.shortcuts import render, redirect
from . import forms
from django.contrib import messages
from django.contrib.auth.views import LoginView
from .forms import MyAuthenticationForm

# Create your views here.
def register(request):
    if request.method == 'POST':
        form = forms.UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            first_name = form.cleaned_data.get('first_name')
            messages.success(
                request, f'Welcome {first_name}! Your account has successfully been created. You may now login.')
            return redirect('login')
    else:
        form = forms.UserRegisterForm()
    return render(request, 'base/register.html', {'form': form})

class MyLoginView(LoginView):
    form_class = MyAuthenticationForm

