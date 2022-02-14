from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .job_scraping import get_jobs
from .skills_extraction import extract_skills
from .serializers import SkillSerializer
from .models import JobTitle, Skill, InvalidSkill

# Create your views here.
class AnswersView(APIView):
	def post(self, request):
		if request.data:
			print(request.data['age'], request.data['gender'], request.data['yearOfStudy'])
			return Response({'hey': 'it worked'}, status=status.HTTP_200_OK)
		else:
			print(request.data)
			return Response({'error': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)


class GetJobsView(APIView):
	permission_classes = [IsAdminUser]

	def post(self, request):
		position = request.data['position']
		location = request.data['location']
		country = request.data['country']
		remote = request.data['remote']
		num = int(request.data['number'])
		get_jobs(position, location, num, country, remote)
		return Response({'hey': 'it worked'}, status=status.HTTP_200_OK)


class GetSkillsView(APIView):
	permission_classes = [IsAdminUser]

	def post(self, request):
		position = request.data['position']
		location = request.data['location']
		distance = int(request.data['distance'])
		try:
			extract_skills(position, location, distance)
			return Response({"success": "success"}, status=status.HTTP_200_OK)
		except Exception as ex:
			print(ex)
			return Response({"error": str(ex)}, status=status.HTTP_400_BAD_REQUEST)


class ListSkillsView(ListAPIView):
	serializer_class = SkillSerializer

	def get_queryset(self):
		return Skill.objects.filter(verified=False)[:50]


class UpdateSkillsView(APIView):
	def post(self, request):
		skills = request.data
		for skill in skills:
			job_title = JobTitle.objects.filter(name=skill['job_title'])
			if len(job_title) == 0:
				print("could not get job title")
				continue
			job_title = job_title[0]
			query = Skill.objects.filter(name=skill['skill'], job_title=job_title)
			if len(query) > 0:
				query = query[0]
				if skill['value'] == "good":
					query.verified = True
					query.save()
				if skill['value'] == "invalid":
					InvalidSkill.objects.get_or_create(job_title=job_title, name=skill['skill'], specific=False)
					query.delete()
				if skill['value'] == "invalid2":
					InvalidSkill.objects.get_or_create(job_title=job_title, name=skill['skill'], specific=True)
					query.delete()
			else:
				print("could not get skill")
		new_skills = Skill.objects.filter(verified=False)[:50]
		new_skill_list = []
		for skill in new_skills:
			new_skill_list.append(SkillSerializer(skill).data)
		return Response({"success": "successfully updated skills", "new_skills": new_skill_list}, status=status.HTTP_200_OK)
