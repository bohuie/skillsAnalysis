from base.models import Profile
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.core.files.storage import FileSystemStorage
from resume_parser import resumeparse
from datetime import datetime
import hashlib
import logging
import json
import threading
import contextlib
import os
from rest_framework.permissions import IsAdminUser
from .skills_extraction import extract_skills
from .serializers import SkillSerializer
from .models import JobPosting, JobTitle, Skill, InvalidSkill

# Create your views here.
class AnswersView(APIView):
	def post(self, request):
		try:
			if request.data and 'age' in request.data and 'gender' in request.data and 'yearOfStudy' in request.data:		
				if Profile.objects.filter(user = request.user).exists():
					Profile.objects.filter(user = request.user).update(age = request.data['age'], gender = request.data['gender'], yearOfStudy = request.data['yearOfStudy'])
				else:
					Profile.objects.create(user = request.user, age = request.data['age'], gender = request.data['gender'], yearOfStudy =  request.data['yearOfStudy'])
				return Response({
						"message" : "Successfully updated user profile"
					}, status=status.HTTP_200_OK)
			else:
				logging.debug(request.data)
				return Response({
						"message" : "Bad Request"
					}, status=status.HTTP_400_BAD_REQUEST)
		except Exception as e:
			logging.debug(str(e))
			return Response({
						"message" : "Internal Server Error"
					}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

 
# User views
class GetUserProfileView(APIView):
	def get(self, request, format=None):
		if request.user.is_authenticated:
			if Profile.objects.filter(user = request.user).exists():
				profile = Profile.objects.filter(user = request.user).values()[0]
				profile["gender"] = Profile.Gender[profile["gender"]].value
				profile["yearOfStudy"] = Profile.Year[profile["yearOfStudy"]].value
				profile["full_name"] = request.user.get_full_name()
				profile["email"] = request.user.email
				return Response({
					"message" : "Retrived user profile",
					"profile": profile	
				}, status=status.HTTP_200_OK)
			else:
				return Response({
					"message": "User does not have a profile"
				}, status=status.HTTP_400_BAD_REQUEST)
		else:
			return Response({
					"message": "User not logged in."
				}, status=status.HTTP_401_UNAUTHORIZED)
	
class UpdateUserSkillsView(APIView):
	def post(self, request):
		if request.user.is_authenticated:
			if not hasattr(request.user, "profile"):
				return Response({
					"message": "User does not have a profile"
				}, status=status.HTTP_400_BAD_REQUEST)
			skills = request.data
			skills_array = [] 
			for skill in skills:
				skills_array.append(skill['value'])
			Profile.objects.filter(user = request.user).update(skills = json.dumps(skills_array))
			return Response({
					"message" : "Successfully updated skills.",
				}, status=status.HTTP_200_OK)
		else:
			return Response({
					"message": "User not logged in."
				}, status=status.HTTP_401_UNAUTHORIZED)

class ResumeUploadView(APIView):
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
					return Response({
						"message": "File uploaded, processing"
					}, status=status.HTTP_200_OK)
				else:
					return Response({
						"message": "User does not have a profile"
					}, status=status.HTTP_400_BAD_REQUEST)

			except Exception as e:
				print ('%s (%s)' % (e.message, type(e)))
				return Response({
					"message": "Something went wrong"
				}, status=status.HTTP_400_BAD_REQUEST)
		else:
			return Response({
				"message": "Empty request"
			}, status=status.HTTP_400_BAD_REQUEST)

	def parse_resume_async(v, path, request):
		Profile.objects.filter(user = request.user).update(resume_processing = True)
		
		#logging.debug("Parsing...")
		with open(os.devnull, "w") as f, contextlib.redirect_stdout(f):
			data = resumeparse.read_file(path)
		#logging.debug("Full parsed data: " + str(data))
		
		skills = []
		for skill in data['skills']:
			skills.append(skill.strip())

		Profile.objects.filter(user = request.user).update(skills = json.dumps(skills))
		Profile.objects.filter(user = request.user).update(resume_processing = False)
		
class CheckUserView(APIView):
	def get(self, request, format=None):
		if request.user.is_authenticated:
			return Response({'hey': 'it worked'}, status=status.HTTP_200_OK)
		else:
			return Response({'error': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)

class GetJobTitleView(APIView):
	def get(self,request,format=None):
		if request.user.is_authenticated:
			jobTitle = JobTitle.objects.all().values()
			return Response({'title': jobTitle}, status=status.HTTP_200_OK)
		else:
			return Response({'error': 'User not logged in.'}, status=status.HTTP_401_UNAUTHORIZED)

class GetJobSkillView(APIView):
	def post(self, request):
		if request.data:		
			jobTitle = request.data['job']
			jobSkill = Skill.objects.filter(job_title__name =jobTitle, verified = True).values('name','count').order_by('-count')[:100]
			return Response({'skills': jobSkill},status=status.HTTP_200_OK)	
		else:
			print(request.data)
			return Response({'error': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)

class GetAllProfileView(APIView):
	def get(self, request, format=None):
		if request.user.is_authenticated:
			profile = Profile.objects.all().values('skills')
			return Response({'success': profile}, status=status.HTTP_200_OK)
		else:
			return Response({'error': 'User not logged in.'}, status=status.HTTP_401_UNAUTHORIZED)
	
