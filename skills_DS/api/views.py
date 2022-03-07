from django.shortcuts import render
from base.models import Profile
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.core.files.storage import FileSystemStorage
from datetime import datetime
import hashlib
from rest_framework.permissions import IsAdminUser
from .job_scraping import get_jobs
from .skills_extraction import extract_skills
from .serializers import SkillSerializer
from .models import JobTitle, Skill, InvalidSkill

# Create your views here.
class AnswersView(APIView):
	def post(self, request):
		if request.data:		
			if Profile.objects.filter(user = request.user).exists():
				Profile.objects.filter(user = request.user).update(age = request.data['age'], gender = request.data['gender'], yearOfStudy = request.data['yearOfStudy'])
			else:
				Profile.objects.create(user = request.user, age = request.data['age'], gender = request.data['gender'], yearOfStudy = request.data['yearOfStudy'])
			return Response({'success': 'success'}, status=status.HTTP_200_OK)
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
		radius = int(request.data['radius'])
		try:
			get_jobs(position, location, num, country, remote, radius)
			return Response({'success': 'success'}, status=status.HTTP_200_OK)
		except Exception as e:
			print(str(e))
			return Response({"error": "Could not get jobs", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
	permission_classes = [IsAdminUser]
	serializer_class = SkillSerializer

	def get_queryset(self):
		return Skill.objects.filter(verified=False)[:20]


class UpdateSkillsView(APIView):
	permission_classes = [IsAdminUser]
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
				return Response({"error": "Could not get skills"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)	
		new_skills = Skill.objects.filter(verified=False)[:50]
		new_skill_list = []
		for skill in new_skills:
			new_skill_list.append(SkillSerializer(skill).data)
		return Response({"success": "successfully updated skills", "new_skills": new_skill_list}, status=status.HTTP_200_OK)

class FileUploadView(APIView):
	parser_classes = (MultiPartParser,)

	def post(self, request, format=None):
		file_obj = request.FILES['file']
		# do something with the file
		if(file_obj):
			try:
				current_user = request.user
				fs = FileSystemStorage()
				fs.save(hashlib.sha256(current_user.email.encode()).hexdigest() + "_" + datetime.now().strftime('%m-%d-%Y_%H-%M-%S') + ".pdf", file_obj)
			except:
				return Response({'error': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)
			return Response({'success': 'it worked'}, status=status.HTTP_200_OK)
		else:
			return Response({'error': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)


