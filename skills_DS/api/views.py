from base.models import Profile
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.core.files.storage import FileSystemStorage
from django.db.models import OuterRef, Subquery
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
from api.models import JobPosting, JobTitle
from .serializers import JobPostingSerializer
import re
import math
from collections import Counter
from api.views_admin import ScrapeJobsView

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
				profile["skills"] = json.loads(profile["skills"])
				profile["gender"] = Profile.Gender[profile["gender"]].value
				profile["yearOfStudy"] = 1 
				profile["full_name"] = request.user.get_full_name()
				profile["email"] = request.user.email
				return Response({
					"message" : "Successfully retrived user profile",
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
			skills = request.data['skills']
			skills_array = [] 
			for skill in skills:
				skills_array.append(skill['value'])
			current_skills = json.loads(Profile.objects.filter(user = request.user).values()[0]['skills'])
			if (request.data['timestamp'] in current_skills):
				current_skills[request.data['timestamp']] = skills_array
				Profile.objects.filter(user = request.user).update(skills = json.dumps(current_skills))
				return Response({
					"message" : "Successfully updated skills.",
				}, status=status.HTTP_200_OK)
			else:
				return Response({
					"message": "Non exsisting key."
				}, status=status.HTTP_400_BAD_REQUEST)
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
				curr_timestamp = str(int(datetime.now().timestamp()))
				fname = hashlib.md5(current_user.email.encode()).hexdigest() + "_" + curr_timestamp + ".pdf"
				fs.save(fname, file_obj)
				fpath = fs.path(fname)
				logging.debug("Recieved file: " + fpath)
				if Profile.objects.filter(user = request.user).exists():
					t = threading.Thread(target=self.parse_resume_async,args=[fpath,curr_timestamp,request])
					t.start()
					return Response({
						"message": "Successfully uploaded file, processing"
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

	def parse_resume_async(v, path, curr_timestamp, request):
		Profile.objects.filter(user = request.user).update(resume_processing = True)
		
		#logging.debug("Parsing...")
		with open(os.devnull, "w") as f, contextlib.redirect_stdout(f):
			data = resumeparse.read_file(path)
		#logging.debug("Full parsed data: " + str(data))
		
		skills = []
		for skill in data['skills']:
			skills.append(skill.strip())
		current_skills = json.loads(Profile.objects.filter(user = request.user).values()[0]['skills'])
		current_skills[curr_timestamp] = skills
		Profile.objects.filter(user = request.user).update(skills = json.dumps(current_skills))
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

class GetSkillsInformation(APIView):
	def post(self, request):
		if request.data:
			skills = request.data['skills']
			skills_info = []
			for skill in skills:
				skill_info = Skill.objects.filter(name=skill, verified = True).values('name','job_title__name', 'count')
				if len(skill_info) > 0:
					skills_info += skill_info
			return Response({
					"message" : "Retrived skills information",
					"skills_info": skills_info	
				}, status=status.HTTP_200_OK)
		else:
			print(request.data)
			return Response({
					"message": "Missing data."
				}, status=status.HTTP_400_BAD_REQUEST)
	
	def get(self, request):
		top_skills_per_job = Skill.objects.filter(
    			job_title_id=OuterRef('job_title_id'),
				verified = True
			).order_by('-count')[:10]
		top_skills = Skill.objects.filter(
				id__in=Subquery(top_skills_per_job.values('id'))
			).values('name','count', 'job_title__name') 
		return Response({
					"message" : "Retrived skills information",
					"skills_info": top_skills	
				}, status=status.HTTP_200_OK)


class GetAllProfileView(APIView):
	def get(self, request, format=None):
		if request.user.is_authenticated:
			profile = Profile.objects.all().values('skills')
			return Response({'success': profile}, status=status.HTTP_200_OK)
		else:
			return Response({'error': 'User not logged in.'}, status=status.HTTP_401_UNAUTHORIZED)


class MatchJobsView(APIView):

	prog = re.compile(r"\w+")
	JOBS_TO_SCRAPE = 100

	def post(self, request):
		if not request.user.is_authenticated:
			return Response({
				"message": "User not logged in."
			}, status=status.HTTP_401_UNAUTHORIZED)
		if Profile.objects.filter(user = request.user).exists():
			position = request.data['position']
			location = request.data['location']
			remote = request.data['remote']
			distance = int(request.data['distance'])
			user_skills = json.loads(request.user.profile.skills)
			if len(user_skills) == 0:
				return Response({
					"message": "You need to add some skills to your profile before you can get matching jobs."
				}, status=status.HTTP_400_BAD_REQUEST)
			user_vector = Counter(self.prog.findall(" ".join(user_skills)))
			(x1, x2, y1, y2) = self.get_coordinates(location, distance)
			titles = JobTitle.objects.filter(name=position.lower())
			if len(titles) < 10:
				t = threading.Thread(target=ScrapeJobsView.scrape_jobs,args=[ScrapeJobsView,position, location, self.JOBS_TO_SCRAPE, location['country'], remote, distance])
				t.start()
				if len(titles) == 0:
					return Response({
						"message": "Could not find any jobs in the database."
					}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
			title = titles[0]
			jobs = JobPosting.objects.filter(location__lat__gte=x1, location__lat__lte=x2, location__lng__gte=y1, location__lng__lte=y2, job_title=title)
			if len(jobs) < 10:
				t = threading.Thread(target=ScrapeJobsView.scrape_jobs,args=[ScrapeJobsView, position, location, self.JOBS_TO_SCRAPE, location['country'], remote, distance])
				t.start()
				if len(jobs) == 0:
					return Response({
						"message": "Could not find any jobs in the database."
					}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
			if remote == "only":
				jobs = jobs.filter(remote=True)
			elif remote == "none":
				jobs = jobs.filter(remote=False)
			matching_jobs = []
			skipped_jobs = 0
			for job in jobs:
				job_vector = Counter(self.prog.findall(job.description))
				score = self.get_cosine(user_vector, job_vector)
				if score > 0:
					matching_jobs.append({"job": JobPostingSerializer(job).data, "score": score})
				else:
					skipped_jobs+=1
			return Response({
				"message": "Successfully matched jobs",
				"jobs": matching_jobs[:25],
				"skipped": skipped_jobs,
			}, status=status.HTTP_200_OK)
		else:
			return Response({
				"message": "User does not have a profile"
			}, status=status.HTTP_400_BAD_REQUEST) 

	def get_cosine(self, vec1, vec2):
		intersection = set(vec1.keys()) & set(vec2.keys())
		numerator = sum([vec1[x] * vec2[x] for x in intersection])

		sum1 = sum([vec1[x] ** 2 for x in list(vec1.keys())])
		sum2 = sum([vec2[x] ** 2 for x in list(vec2.keys())])
		denominator = math.sqrt(sum1) * math.sqrt(sum2)

		if not denominator:
			return 0.0
		else:
			return float(numerator) / denominator
	
	def get_coordinates(self, location, distance):
		dist = ((math.sqrt(2)/2) * distance)
		lat = dist/110.574
		lng = dist/(111.320*math.cos(math.radians(lat)))

		return (location['lat'] - lat,location['lat'] + lat,location['lng'] - lng,location['lng'] + lng)
