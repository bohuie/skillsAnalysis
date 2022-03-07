from django.shortcuts import render
from base.models import Profile
from rest_framework import status
from rest_framework.views import APIView
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

# Create your views here.
class AnswersView(APIView):
	def post(self, request, format=None):
		if request.data:		
			if Profile.objects.filter(user = request.user).exists():
				Profile.objects.filter(user = request.user).update(age = request.data['age'], gender = request.data['gender'], yearOfStudy = request.data['yearOfStudy'])
			else:
				Profile.objects.create(user = request.user, age = request.data['age'], gender = request.data['gender'], yearOfStudy = request.data['yearOfStudy'])
			return Response({'hey': 'it worked'}, status=status.HTTP_200_OK)
		else:
			print(request.data)
			return Response({'error': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)
		
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
