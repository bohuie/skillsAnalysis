from django.test import TestCase
from api.models import Skill, InvalidSkill, JobPosting, JobTitle, Location
from base.models import User
import time
from rest_framework.test import APIClient
from base.models import Profile
import json

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

	def test_answers_view(self):
		self.assertFalse(hasattr(self.user, "profile"))
		data = self.client.post("/api/answers", {"age": 12, "gender": Profile.Gender("Male").value, "yearOfStudy": Profile.Year("3").value}, format='json').data
		self.user.refresh_from_db()
		self.assertIn("Success", data['message'])
		self.assertTrue(self.user.profile)
		self.assertEqual(self.user.profile.age, 12)
		data = self.client.post("/api/answers", {"age": 15, "gender": Profile.Gender("Male").value, "yearOfStudy": Profile.Year("3").value}, format='json').data
		self.user.refresh_from_db()
		self.assertIn("Success", data['message'])
		self.assertTrue(self.user.profile)
		self.assertEqual(self.user.profile.age, 15)

	
	def test_get_profile_view(self):
		self.assertFalse(hasattr(self.user, "profile"))
		res = self.client.get("/api/get-profile", format='json')
		self.assertEqual(res.status_code, 400)
		self.client.post("/api/answers", {"age": 12, "gender": Profile.Gender("Male").value, "yearOfStudy": Profile.Year("3").value}, format='json')
		self.user.refresh_from_db()
		self.assertTrue(hasattr(self.user, "profile"))
		data = self.client.get("/api/get-profile", format='json').data
		self.assertIn("Success", data['message'])
		self.client.logout()
		res = self.client.get("/api/get-profile", format='json')
		self.assertEqual(res.status_code, 401)
		
	def test_update_user_skills(self):
		#api view should check if user has profile
		#self.assertFalse(hasattr(self.user, "profile"))
		#res = self.client.get("/api/update-user-skills", format='json')
		#self.assertEqual(res.status_code, 400)
		self.client.post("/api/answers", {"age": 12, "gender": Profile.Gender("Male").value, "yearOfStudy": Profile.Year("3").value}, format='json')
		self.user.refresh_from_db()
		self.assertTrue(hasattr(self.user, "profile"))
		self.assertEqual(len(json.loads(self.user.profile.skills)), 0)
		data = self.client.post("/api/update-user-skills", [{"value":"java"}, {"value":"html"}, {"value":"css"}], format='json').data
		self.assertIn("Success", data['message'])
		self.user.refresh_from_db()
		self.assertEqual(len(json.loads(self.user.profile.skills)), 3)
		self.client.logout()
		res = self.client.get("/api/get-profile", format='json')
		self.assertEqual(res.status_code, 401)