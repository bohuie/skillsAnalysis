from rest_framework.serializers import ModelSerializer, CharField
from .models import Skill

class SkillSerializer(ModelSerializer):
	job_title = CharField(source="job_title.name")

	class Meta:
		model = Skill
		fields = ('name', 'job_title', )