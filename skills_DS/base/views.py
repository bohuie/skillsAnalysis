from . import forms
from .forms import UserLoginForm
from .utils import token_generator
from base.models import Profile
from rest_framework.response import Response

from django.views import View
from django.contrib import messages
from django.contrib.auth import login, get_user_model, authenticate
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.shortcuts import render, redirect, get_object_or_404
from django.core.mail import send_mail
from django.template.loader import render_to_string

from skills_DS.settings import EMAIL_HOST_USER

# Create your views here.
def register(request):
    # User = get_user_model()
    if request.method == 'POST':
        form = forms.UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()

            current_site = get_current_site(request)
            mail_subject = 'Activate your account.'

            message = render_to_string('base/email_template.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': token_generator.make_token(user),
            })
            to_email = form.cleaned_data.get('email')
            send_mail(mail_subject, message, EMAIL_HOST_USER, [to_email])

            first_name = form.cleaned_data.get('first_name')
            messages.warning(
                request, f'Welcome {first_name}! Your account has successfully been created. Please verify your account through email.')
            return redirect('login')
    else:
        form = forms.UserRegisterForm()
    return render(request, 'base/register.html', {'form': form})

def _login(request):
    if request.method == 'POST':
        form = UserLoginForm(request.POST)
        username = request.POST['username']
        password = request.POST['password']
        User = get_user_model()
        try:
            user = get_object_or_404(User, email=username)
        except:
            messages.error(request, 'Email or password not correct!')
            return render(request, 'base/login.html', {'form': form})
        # user = User.objects.get(email=username)
    
        if form.is_valid():
            if user is not None:
                userAuth = authenticate(username=username, password=password)
                
                if not user.is_active:
                    current_site = get_current_site(request)
                    mail_subject = 'Activate your account.'

                    message = render_to_string('base/email_template.html', {
                        'user': user,
                        'domain': current_site.domain,
                        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                        'token': token_generator.make_token(user),
                    })
                    to_email = username
                    send_mail(mail_subject, message, EMAIL_HOST_USER, [to_email])

                    messages.warning(request, 'We have resent a verification email. Please verify your account to login.')
                    return redirect('login')

                if userAuth:
                    login(request, user)
                    return redirect('/login-redirect/')
                else:      
                    messages.error(request, 'Email or password not correct!')
                    return render(request, 'base/login.html', {'form': form})
            else:
                messages.error(request, 'Email or password not correct!')
                return render(request, 'base/login.html', {'form': form})
        else:
            messages.error(request, 'Please solve the Captcha!')
            return render(request, 'base/login.html', {'form': form})
    else:
        form = UserLoginForm()
    return render(request, 'base/login.html', {'form': form})

def activate(request, uidb64, token):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user is not None and token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return Response('Thank you for your email confirmation. Now you can login your account.')
    else:
        return Response('Activation link is invalid!')

def user_profile(request):
    if Profile.objects.filter(user = request.user).exists():
        return redirect("/profile")
    else:
        return redirect("/questions")

def login_redirect(request):
    if Profile.objects.filter(user = request.user).exists():
        return redirect("/")
    else:
        return redirect("/questions")

class VerificationView(View):
    def get(self, request, uidb64, token):
        activate(request, uidb64, token)
        messages.success(
                request, 'Your account has been successfully activated. Please login to continue.')
        return redirect('login')
