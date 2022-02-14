from django.db import models

# Create your models here.


class Location(models.Model):
    name = models.CharField(max_length=100)
    lat = models.DecimalField(decimal_places=15, max_digits=18)
    lng = models.DecimalField(decimal_places=15, max_digits=18)

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
    description = models.CharField(max_length=20000)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True)
    job_title = models.ForeignKey(JobTitle, on_delete=models.SET_NULL, null=True)
    scraped = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class Skill(models.Model):
    name = models.CharField(max_length=100)
    job_title = models.ForeignKey(JobTitle, on_delete=models.SET_NULL, null=True, related_name="job_title")
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True)
    count = models.IntegerField(default=0)
    verified = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class InvalidSkill(models.Model):
    name = models.CharField(max_length=100)
    job_title = models.ForeignKey(JobTitle, on_delete=models.SET_NULL, blank=True, null=True)
    specific = models.BooleanField()

    def __str__(self):
        return self.name