from bs4 import BeautifulSoup
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.generics import ListAPIView
from .models import Location, JobPosting, JobTitle, Skill, InvalidSkill
from base.models import Profile
from requests_futures.sessions import FuturesSession
from concurrent.futures import ThreadPoolExecutor
from .serializers import SkillSerializer
import logging
import threading
import requests
import re
import math
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet
from django.core import serializers

class ScrapeJobsView(APIView):
    permission_classes = [IsAdminUser]

    progress = {"processing": False, "num_scraped": 0}

    def post(self, request):
        if not ScrapeJobsView.progress["processing"]:
            position = request.data['position']
            location = request.data['location']
            country = request.data['country']
            remote = request.data['remote']
            num = int(request.data['number'])
            radius = int(request.data['radius'])
            ScrapeJobsView.progress = {"processing": True, "num_scraped": 0}
            t = threading.Thread(target=self.scrape_jobs, args=[
                                 position, location, num, country, remote, radius])
            t.start()
            return Response({
                    'message': 'Successfully started job scraping.'
                }, status=status.HTTP_200_OK)
        else:
            return Response({
                "message": "Job scraping in progress"
            }, status=status.HTTP_409_CONFLICT)

    # Progress
    def get(self, request):
        return Response({
            "message": "Job scraping status",
            "progress": ScrapeJobsView.progress
        }, status=status.HTTP_200_OK)

    def scrape_jobs(self, position, location, num, country, remote, radius):
        try:
            records = []
            url = self.get_url(position=position, location=location['name'], country=country, radius=radius)
            i = 0
            while num > i:
                ScrapeJobsView.progress["num_scraped"] = i

                urls = []
                # logging.debug(url)
                response = requests.get(url)
                soup = BeautifulSoup(response.text, 'html.parser')
                cards = soup.find_all('a', 'resultWithShelf')

                for card in cards:
                    if i >= num: break
                    if type(card.find('div', 'companyLocation')) != type(None):
                        job_location = card.find(
                            'div', 'companyLocation').text.lower()
                    else:
                        job_location = ''
                    if remote == "none" and "remote" in job_location:
                        continue
                    temp_Location = job_location.split(',')[0]
                    logging.debug(temp_Location)

                    if(temp_Location == location['name'].split(" ")[0].lower()):
                        # logging.debug('https://ca.indeed.com' + card.get('href'))
                        if(card.get('href') is not None):
                            urls.append('https://ca.indeed.com' +
                                        card.get('href'))
                            i += 1
                            ScrapeJobsView.progress["num_scraped"] = i

                num_workers = 10 if len(urls) < 10 else len(urls)
                session = FuturesSession(
                    executor=ThreadPoolExecutor(max_workers=num_workers))
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36',
                    'Content-Type': 'text/html',
                }
                reqs = [session.get(url, headers=headers) for url in urls]
                for index, req in enumerate(reqs):
                    resp = req.result()
                    record = self.get_record(page=resp.content)
                    if record is not None:
                        records.append(record + (urls[index],))
                        
                try:
                    url = 'https://ca.indeed.com' + \
                        soup.find('a', {'aria-label': 'Next'}).get('href')
                except AttributeError:
                    break

            logging.debug(f"Successfully scraped {len(records)} jobs.")

            loc, created = Location.objects.get_or_create(
                name=location['name'].lower(), lat=location['lat'], lng=location['lng'])

            title, created = JobTitle.objects.get_or_create(
                name=position.lower())

            for record in records:
                obj, created = JobPosting.objects.get_or_create(title=record[0], company=record[1], is_remote=record[2], )
                if created:
                    obj.description=record[3] 
                    obj.location=loc 
                    obj.job_title=title
                    obj.url=record[4]
                    obj.save()

            ScrapeJobsView.progress["processing"] = False
        except Exception as e:
            logging.debug("Something went wrong.")
            logging.debug(e)
            ScrapeJobsView.progress["processing"] = False

    def get_url(self, position, location, country, radius):
        if country == "CA":
            return f'https://ca.indeed.com/jobs?q={position}&l={location}&radius={radius}'
        else:
            return f'https://indeed.com/jobs?q={position}&l={location}&radius={radius}'

    def get_record(self, page):
        card = BeautifulSoup(page, 'html.parser')

        if type(card.find(id='jobDescriptionText')) == type(None):
            description = ""
        else:
            description = card.find(id='jobDescriptionText').text.strip()

        if type(card.find('div', 'jobsearch-InlineCompanyRating')) == type(None):
            company = ""
        else:
            company = card.find('div', 'jobsearch-InlineCompanyRating').text.strip()
            if company.split(" ")[-1] == "reviews":
                company = " ".join(company.split(" ")[:-1])
                while company[-1].isnumeric():
                    company = company[:-1]

        if type(card.find('div', 'jobsearch-JobInfoHeader-title-container')) == type(None):
            job_title = ""
        else:
            job_title = card.find(
                'div', 'jobsearch-JobInfoHeader-title-container').text.strip()

        isRemote = "remote" in company

        if description == "":
            return None
        return (job_title, company, isRemote, description)


class ExtractSkillsView(APIView):
    permission_classes = [IsAdminUser]

    progress = {"processing": False, "num_processed": 0}
    stop_words = set(stopwords.words("english"))
    lemmatizer = WordNetLemmatizer()

    custom_stopwords = []

    def post(self, request):
        position = request.data['position']
        location = request.data['location']
        distance = int(request.data['distance'])
        if not ExtractSkillsView.progress["processing"]:
            try:
                titles = JobTitle.objects.filter(name=position.lower())
                if len(titles) == 0:
                    return Response({
                            "message": "There are no jobs in the database for the provided position."
                        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                title = titles[0]
                (x1, x2, y1, y2) = self.get_coordinates(location, distance)
                # logging.debug(x1,x2,y1,y2)
                jobs = JobPosting.objects.filter(
                    location__lat__gte=x1, location__lat__lte=x2, location__lng__gte=y1, location__lng__lte=y2, job_title=title)
                if len(jobs) == 0:
                    return Response({
                        "message": "Could not find any jobs in the provided location."
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                logging.debug(len(jobs))
                logging.debug("thats the len of jobs")

                ExtractSkillsView.progress = {
                    "processing": True, "num_processed": 0}
                t = threading.Thread(target=self.extract_skills, args=[
                                     jobs, title, location])
                t.start()

                return Response({
                            "message": "Successfully started extracting skills",
                            "num_jobs": len(jobs)
                        }, status=status.HTTP_200_OK)

            except Exception as ex:
                logging.debug(str(ex))
                return Response({
                            "message": str(ex)
                        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
             return Response({
                "message": "Skill extracting in progress"
            }, status=status.HTTP_409_CONFLICT)

    # Progress
    def get(self, request):
        return Response({
            "message": "Skill extraction progress",
            "progress": ExtractSkillsView.progress
        }, status=status.HTTP_200_OK)

    def extract_skills(self, jobs, title, location):
        try:
            freq = {}
            i = 0
            for job in jobs:
                description = job.description.lower()
                description = re.sub("(?:\r\n|\r|\n)", '.', description)
                description = re.sub("\s+", " ", description)
                description = re.sub("\.", ".", description)

                sentences = sent_tokenize(description)
                nouns = []
                bigrams = []
                for sentence in sentences:
                    words = []
                    pos_words = nltk.pos_tag(word_tokenize(sentence))
                    for word in pos_words:
                        if word[0] not in ExtractSkillsView.stop_words and word[0] not in ExtractSkillsView.custom_stopwords and wordnet.synsets(word[0]):
                            words.append(
                                ExtractSkillsView.lemmatizer.lemmatize(word[0]))
                            if word[1] == "NN":
                                nouns.append(
                                    ExtractSkillsView.lemmatizer.lemmatize(word[0]))

                    for i in range(len(words)-1):
                        bigrams.append(f"{words[i]} {words[i+1]}")

                    for bigram in bigrams:
                        if bigram not in ExtractSkillsView.custom_stopwords:
                            if bigram in freq:
                                freq[bigram] += 1
                            else:
                                freq[bigram] = 1

                    for noun in nouns:
                        if noun in freq:
                            freq[noun] += 1
                        else:
                            freq[noun] = 1

                    i = i+1
                    ExtractSkillsView.progress["num_processed"] = i

            skill_location, created = Location.objects.get_or_create(
                name=location['name'].lower(), lat=location['lat'], lng=location['lng'])

            for key, value in freq.items():
                if value > len(jobs):
                    skill, created = Skill.objects.get_or_create(
                        name=key, location=skill_location, job_title=title)
                    skill.count += value
                    skill.save()

            jobs.update(scraped=True)
            ExtractSkillsView.progress["processing"] = False

        except Exception as e:
            logging.debug("Something went wrong.")
            logging.debug(e)
            ExtractSkillsView.progress["processing"] = False

    def get_coordinates(self, location, distance):
        dist = ((math.sqrt(2)/2) * distance)
        lat = dist/110.574
        lng = dist/(111.320*math.cos(math.radians(lat)))

        return (location['lat'] - lat, location['lat'] + lat, location['lng'] - lng, location['lng'] + lng)


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
                logging.debug("could not get job title")
                continue
            job_title = job_title[0]
            query = Skill.objects.filter(
                name=skill['skill'], job_title=job_title)
            if len(query) > 0:
                query = query[0]
                if skill['value'] == "good":
                    query.verified = True
                    query.save()
                if skill['value'] == "invalid":
                    InvalidSkill.objects.get_or_create(
                        job_title=job_title, name=skill['skill'], specific=False)
                    query.delete()
                if skill['value'] == "invalid2":
                    InvalidSkill.objects.get_or_create(
                        job_title=job_title, name=skill['skill'], specific=True)
                    query.delete()
            else:
                return Response({
                    "message": "Could not get skills"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        new_skills = Skill.objects.filter(verified=False)[:50]
        new_skill_list = []
        for skill in new_skills:
            new_skill_list.append(SkillSerializer(skill).data)
        return Response({
                "message": "Successfully updated skills",
                "new_skills": new_skill_list
            }, status=status.HTTP_200_OK)


class GetSkillsGender(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            profile_set = list(Profile.objects.values())
            return Response({
                "message": "Retrived profile skills and gender",
                "profile": profile_set
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "message": e,
            }, status=status.HTTP_400_BAD_REQUEST)

