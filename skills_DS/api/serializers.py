from rest_framework.serializers import ModelSerializer, CharField
from .models import JobPosting, Skill

class SkillSerializer(ModelSerializer):
	job_title = CharField(source="job_title.name")

	class Meta:
		model = Skill
		fields = ('name', 'job_title', )

class JobPostingSerializer(ModelSerializer):
	place = CharField(source="location.name")
	
	class Meta:
		model = JobPosting
		fields = ('title','url','is_remote','place','description','company')