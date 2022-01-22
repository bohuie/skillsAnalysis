from django.db import models

# Create your models here.


class Location(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class JobTitle(models.Model):
    name = models.CharField(max_length=250)
    #industry = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class JobPosting(models.Model):
    title = models.CharField(max_length=250)
    company = models.CharField(max_length=100)
    is_remote = models.BooleanField()
    description = models.CharField(max_length=2000)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    job_title = models.ForeignKey(JobTitle, on_delete=models.CASCADE)

    def __str__(self):
        return self.title