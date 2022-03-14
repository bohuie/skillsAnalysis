from django.test import TestCase
from api.models import Skill, InvalidSkill, JobPosting, JobTitle, Location
from base.models import User
import time
from rest_framework.test import APIClient
from base.models import Profile
import json
from django.core.files import File
from django.core.files.uploadedfile import SimpleUploadedFile
from os import getcwd

class TestViews(TestCase):
	def setUp(self):
		self.client = APIClient()
		admin_user = User(email="test@test.test", is_staff=True)
		user_password = "tadpas1234"
		admin_user.set_password(user_password)
		admin_user.save()
		self.user = admin_user
		self.user_password = user_password
		normal_user = User(email="test2@test.test", is_staff=False)
		normal_user_password = "tnmpas1234"
		normal_user.set_password(normal_user_password)
		normal_user.save()
		self.normal_user = normal_user
		self.normal_user_password = normal_user_password
		self.client.login(email=admin_user.email, password=user_password)

	def get_jobs_view_test(self):
		self.client.logout()
		self.client.login(email=self.normal_user.email, password=self.normal_user_password)

		res = self.client.post("/api/scrape-jobs", {"position": "software developer", "location": "Kelowna BC", "country": "Canada", "remote": "allowed", "number": 3, "radius": 10}, format="json")
		self.assertEqual(res.status_code, 403)

		self.client.logout()
		self.client.login(email=self.user.email, password=self.user_password)
		data = self.client.post("/api/scrape-jobs", {"position": "software developer", "location": {"name": "kelowna british columbia", "lat": 49.887951899999997, "lng": -119.496010600000005}, "country": "CA", "remote": "allowed", "number": 3, "radius": 10}, format="json").data
		self.assertIn("Success", data['message'])
		while self.client.get("/api/scrape-jobs").data['progress']['processing'] == True:
			time.sleep(1)
		self.assertEqual(len(JobPosting.objects.all()), 3)
		self.assertEqual(len(Location.objects.all()), 1)
		self.assertEqual(len(JobTitle.objects.all()), 1)


	def test_extract_skills_view(self):

		self.get_jobs_view_test()
		self.assertGreater(len(JobPosting.objects.all()), 0)

		self.client.logout()
		self.client.login(email=self.normal_user.email, password=self.normal_user_password)

		res = self.client.post("/api/get-skills", {"position": "software developer", "location": {"name": "kelowna british columbia", "lat": 49.887951899999997, "lng": -119.496010600000005}, "distance": 10}, format="json")
		self.assertEqual(res.status_code, 403)

		self.client.logout()
		self.client.login(email=self.user.email, password=self.user_password)

		data = self.client.post("/api/get-skills", {"position": "software developer", "location": {"name": "kelowna british columbia", "lat": 49.887951899999997, "lng": -119.496010600000005}, "distance": 10}, format="json").data
		self.assertIn("Success", data['message'])
		while self.client.get("/api/get-skills").data['progress']['processing'] == True:
			time.sleep(1)
		job_title = JobTitle.objects.filter(name="software developer").first()
		jobs = JobPosting.objects.filter(title=job_title)
		for job in jobs:
			self.assertTrue(job.scraped)
		skills = Skill.objects.all()
		self.assertGreater(len(skills), 1)
		self.assertFalse(skills[0].verified)

	
	def test_list_skills_view(self):

		self.client.logout()
		self.client.login(email=self.normal_user.email, password=self.normal_user_password)

		res = self.client.get("/api/list-skills", format="json")
		self.assertEqual(res.status_code, 403)

		self.client.logout()
		self.client.login(email=self.user.email, password=self.user_password)

		location = Location(name="test", lat=1, lng=1)
		location.save()
		job_title = JobTitle(name="test")
		job_title.save()

		Skill(name="test", location=location, job_title=job_title, count=5, verified=False).save()
		data = self.client.get("/api/list-skills", format="json").data
		self.assertEqual(len(data), min(20,len(Skill.objects.all())))
		data = self.client.get("/api/list-skills", format="json").data
		for x in range(21):
			skill = Skill(name=f"test{x}", location=location, job_title=job_title, count=5, verified=False)
			skill.save()
		data = self.client.get("/api/list-skills", format="json").data
		self.assertEqual(len(data), 20)

	
	def test_update_skills_view(self):

		self.client.logout()
		self.client.login(email=self.normal_user.email, password=self.normal_user_password)

		res = self.client.post("/api/update-skills", [], format="json")
		self.assertEqual(res.status_code, 403)

		self.client.logout()
		self.client.login(email=self.user.email, password=self.user_password)

		location = Location(name="test", lat=1, lng=1)
		location.save()
		job_title = JobTitle(name="test")
		job_title.save()
		skill1 = Skill(name="some nonsense", job_title=job_title, location=location, count=5, verified=False)
		skill2 = Skill(name="machine learning", job_title=job_title, location=location, count=5, verified=False)
		skill3 = Skill(name="some nonsense2", job_title=job_title, location=location, count=5, verified=False)
		skill4 = Skill(name="fly plane", job_title=job_title, location=location, count=5, verified=False)
		skill5 = Skill(name="web development", job_title=job_title, location=location, count=5, verified=False)
		skills = [skill1, skill2, skill3, skill4, skill5]
		values = ["invalid", "good", "invalid", "invalid2","good"]
		skill_data = []
		for idx, skill in enumerate(skills):
			skill.save()
			skill_data.append({"job_title": "test", "skill": skill.name, "value": values[idx]})
		
		data = self.client.post("/api/update-skills", skill_data, format="json").data
		self.assertIn("Success", data['message'])
		self.assertEqual(len(InvalidSkill.objects.all()), 3)
		self.assertEqual(len(InvalidSkill.objects.filter(specific=True)), 1)
		
	
	def test_resume_upload(self):
		data = File(open('api/tests/functionalsample.pdf', 'rb'))
		upload_file = SimpleUploadedFile('data.dump', data.read(), content_type='multipart/form-data')

		self.assertFalse(hasattr(self.user, "profile"))
		res = self.client.post("/api/resume-upload", {'file': upload_file})
		self.assertEqual(res.status_code, 400)
		self.client.post("/api/answers", {"age": 12, "gender": Profile.Gender("Male").value, "yearOfStudy": Profile.Year("3").value}, format='json')
		self.user.refresh_from_db()
		self.assertTrue(hasattr(self.user, "profile"))
		data = self.client.post("/api/resume-upload", {'file': upload_file}).data
		self.assertIn("Success", data['message'])
		self.client.logout()
		res = self.client.get("/api/get-profile", format='json')
		self.assertEqual(res.status_code, 401)
		time.sleep(40) #awaiting task