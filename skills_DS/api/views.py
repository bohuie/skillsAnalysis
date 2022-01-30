from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser
from django.core.files.storage import FileSystemStorage

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
	parser_classes = (FileUploadParser,)

	def post(self, request, format=None):
		file_obj = request.FILES['file']
		# do something with the file
		if(file_obj):
			try:
				fs = FileSystemStorage()
				fs.save(request.user.get_full_name().replace(" ", "_") + ".pdf", file_obj)
			except:
				return Response({'error': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)
			return Response({'hey': 'it worked'}, status=status.HTTP_200_OK)
		else:
			return Response({'error': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)
