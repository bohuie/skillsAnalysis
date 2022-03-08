from django.shortcuts import render
from base.models import Profile
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser, MultiPartParser
from django.http import HttpResponse
from django.core.files.storage import FileSystemStorage
from datetime import datetime
import hashlib
from resume_parser import resumeparse
import logging
import json
import threading
import contextlib
import os
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
		radius = int(request.data['radius'])
		get_jobs(position, location, num, country, remote, radius)
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

class GetUserProfileView(APIView):
	def get(self, request, format=None):
		if request.user.is_authenticated:
			if Profile.objects.filter(user = request.user).exists():
				profile = Profile.objects.filter(user = request.user).values()[0]
				profile["full_name"] = request.user.get_full_name()
				profile["email"] = request.user.email
				return Response({'success': profile}, status=status.HTTP_200_OK)
			else:
				return Response({'error': 'User does not have a profile.'}, status=status.HTTP_400_BAD_REQUEST)
		else:
			return Response({'error': 'User not logged in.'}, status=status.HTTP_401_UNAUTHORIZED)

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
				fname = hashlib.sha256(current_user.email.encode()).hexdigest() + "_" + datetime.now().strftime('%m-%d-%Y_%H-%M-%S') + ".pdf"
				fs.save(fname, file_obj)
				fpath = fs.path(fname)
				logging.debug("Recieved file: " + fpath)
				if Profile.objects.filter(user = request.user).exists():
					t = threading.Thread(target=self.parse_resume_async,args=[fpath,request])
					t.start()
				else:
					logging.debug("User does not have a profile")

			except Exception as e:
				print ('%s (%s)' % (e.message, type(e)))
				return HttpResponse({'error': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)
			return HttpResponse({'hey': 'it worked'}, status=status.HTTP_200_OK)
		else:
			return HttpResponse({'error': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)

	def parse_resume_async(v, path, request):
		Profile.objects.filter(user = request.user).update(resume_processing = True)
		
		logging.debug("Parsing...")
		with open(os.devnull, "w") as f, contextlib.redirect_stdout(f):
			data = resumeparse.read_file(path)
		logging.debug("Full parsed data: " + str(data))

		Profile.objects.filter(user = request.user).update(skills = json.dumps(data['skills']))
		Profile.objects.filter(user = request.user).update(resume_processing = False)
		
class CheckUserView(APIView):
	def get(self, request, format=None):
		if request.user.is_authenticated:
			return Response({'hey': 'it worked'}, status=status.HTTP_200_OK)
		else:
			return Response({'error': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)
