import re
from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .job_scraping import get_jobs

# Create your views here.
class AnswersView(APIView):
	def post(self, request, format=None):
		if request.data:
			print(request.data['age'], request.data['gender'], request.data['yearOfStudy'])
			return Response({'hey': 'it worked'}, status=status.HTTP_200_OK)
		else:
			print(request.data)
			return Response({'error': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)


class GetJobsView(APIView):
	def post(self, request, format=None):
		position = request.data['position']
		location = request.data['location']
		num = int(request.data['number'])
		get_jobs(position, location, num)
		return Response({'hey': 'it worked'}, status=status.HTTP_200_OK)

