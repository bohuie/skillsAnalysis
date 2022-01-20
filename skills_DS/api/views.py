from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser, MultiPartParser

# Create your views here.
class AnswersView(APIView):
	def post(self, request, format=None):
		if request.data:
			print(request.data['age'], request.data['gender'], request.data['yearOfStudy'])
			return Response({'hey': 'it worked'}, status=status.HTTP_200_OK)
		else:
			print(request.data)
			return Response({'error': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)
		
class FileUploadView(APIView):
	# parser_classes = (FileUploadParser,)

	parser_classes = (FileUploadParser,)

	def post(self, request, format=None):
		# print(request.FILES)
		file_obj = request.data['file']
		# do something with the file
		if(file_obj):
			print(file_obj)
			return Response({'hey': 'it worked'}, status=status.HTTP_200_OK)
		else:
			print(file_obj)
			return Response({'error': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)
