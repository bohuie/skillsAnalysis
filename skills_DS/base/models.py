from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from enum import Enum

# Create your models here.


class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    for authentication instead of usernames.
    """
    def create_user(self, email, password, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    email = models.EmailField(('email address'), unique=True)
    username = None

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = CustomUserManager()

    def __str__(self):
        return self.email


class Profile(models.Model):
    
    class Gender(Enum):
        Male = "Male"
        Female = "Female"
        Other = "Other"
        Pref = "Prefer not to say"

    class Year(Enum):
        One = "1"
        Two = "2"
        Three = "3"
        Four = "4"
        Fivep = "5+"

    user = models.OneToOneField(User,on_delete=models.CASCADE, related_name="profile")
    age = models.IntegerField(null=True)
    gender = models.CharField(choices=[(gender.name,gender.value) for gender in Gender],max_length=10)
    yearOfStudy = models.CharField(choices=[(year.name,year.value) for year in Year],max_length=10)
    skills = models.TextField(default="[]")
    resume_processing = models.BooleanField(default=False)
   
    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name}'
    
    
