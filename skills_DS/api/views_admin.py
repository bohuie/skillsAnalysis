from bs4 import BeautifulSoup
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .models import Location, JobPosting, JobTitle
from requests_futures.sessions import FuturesSession
from concurrent.futures import ThreadPoolExecutor
import logging
import threading
import requests

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
            t = threading.Thread(target=self.scrape_jobs,args=[position, location, num, country, remote, radius])
            t.start()
            return Response({
                    'message': 'Job scraping started'
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
            url = self.get_url(position, location['name'], country, radius)
            i = 0
            while num > i:
                ScrapeJobsView.progress["num_scraped"] = i
                
                urls = []
                #logging.debug(url)
                response = requests.get(url)
                soup = BeautifulSoup(response.text, 'html.parser')
                cards = soup.find_all('a', 'resultWithShelf')

                for card in cards:
                    if i >= num: break
                    if type(card.find('div', 'companyLocation'))!=type(None):
                        job_location = card.find('div', 'companyLocation').text.lower()
                    else:
                        job_location=''
                    if remote == "none" and "remote" in job_location:
                        continue
                    temp_Location = job_location.split(',')[0]
                    logging.debug(temp_Location)
                    
                    if(temp_Location==location['name'].split(" ")[0].lower()):
                        #logging.debug('https://ca.indeed.com' + card.get('href'))
                        if(card.get('href') is not None):
                            urls.append('https://ca.indeed.com' + card.get('href'))
                            i+=1

                num_workers = 10 if len(urls) < 10 else len(urls)
                session = FuturesSession(executor=ThreadPoolExecutor(max_workers=num_workers))
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36',
                    'Content-Type': 'text/html',
                }
                reqs = [session.get(url, headers=headers) for url in urls]
                for req in reqs:
                    resp = req.result()
                    record = self.get_record(resp.content)
                    if record is not None:
                        records.append(record)
                        
                try:
                    url = 'https://ca.indeed.com' + soup.find('a', {'aria-label': 'Next'}).get('href')
                except AttributeError:
                    break

            logging.debug(f"Successfully scraped {len(records)} jobs.")

            loc, created = Location.objects.get_or_create(name=location['name'].lower(), lat=location['lat'], lng=location['lng'])

            title, created = JobTitle.objects.get_or_create(name=position.lower())

            for record in records:
                obj, created = JobPosting.objects.get_or_create(title=record[0], company=record[1], is_remote=record[2], description=record[3], location=loc, job_title=title)

            ScrapeJobsView.progress["processing"] = False
        except Exception as e:
            logging.debug("Something went wrong.")
            logging.debug(e)
            ScrapeJobsView.progress["processing"] = False

    def get_url(self, position,location, country, radius):
        if country == "CA":
            return f'https://ca.indeed.com/jobs?q={position}&l={location}&radius={radius}'
        else:
            return f'https://indeed.com/jobs?q={position}&l={location}&radius={radius}'

    def get_record(self, page):
        card = BeautifulSoup(page, 'html.parser')

        if type(card.find(id='jobDescriptionText'))==type(None):
            description=""
        else:
            description = card.find(id='jobDescriptionText').text.strip()
                    
        if type(card.find('div', 'jobsearch-InlineCompanyRating'))==type(None):
            company=""
        else:
            company = card.find('div', 'jobsearch-InlineCompanyRating').text.strip()

        if type(card.find('div', 'jobsearch-JobInfoHeader-title-container'))==type(None):
            job_title=""
        else:
            job_title = card.find('div', 'jobsearch-JobInfoHeader-title-container').text.strip()
        
        isRemote = "remote" in company
        
        if description == "":
            return None
        return (job_title, company, isRemote, description)
