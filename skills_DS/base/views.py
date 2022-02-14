from django.shortcuts import render, redirect
from . import forms
from django.contrib import messages

from django.views import View
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.sites.shortcuts import get_current_site
from .utils import token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.http import HttpResponse
import hashlib
from django.core.mail import EmailMessage
from django.urls import reverse

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
            send_mail(mail_subject, message, 'cosc448atesting@gmail.com', [to_email])

            first_name = form.cleaned_data.get('first_name')
            messages.success(
                request, f'Welcome {first_name}! Your account has successfully been created. Please verify your account through email.')
            return redirect('login')
    else:
        form = forms.UserRegisterForm()
    return render(request, 'base/register.html', {'form': form})

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
        return HttpResponse('Thank you for your email confirmation. Now you can login your account.')
    else:
        return HttpResponse('Activation link is invalid!')

class VerificationView(View):
    def get(self, request, uidb64, token):
        activate(request, uidb64, token)
        messages.success(
                request, 'Your account has been successfully activated. Please login to continue.')
        return redirect('login')
