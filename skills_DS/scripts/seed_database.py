from api.views_admin import ScrapeJobsView,ExtractSkillsView
from api.models import JobTitle, JobPosting
import requests
import json
import os



def run():
    
    # radius/distance
    dist = 20

    #set location for map
    location = 'Toronto'

    #number of jobs
    numJobs = 20

    #set remote
    remote=['none','only','remote']

    # set country
    countries = ['CA']

    #getting a list of jobs
    joblist=[]

    #google maps key
    key= ''

    #getting location from maps
    session = requests.session()
    urlMaps = 'https://maps.googleapis.com/maps/api/geocode/json?address='+location+'&key=' + key
    request = session.get(urlMaps)
    maps = request.json()
    maps = maps['results'][0]['geometry']['location']
    maps['name'] = location

    #scrape job
    scrape = ScrapeJobsView()
    scrape.scrape_jobs(joblist[0],maps,numJobs,countries[0],remote[0],dist)

    #extract skill
    extract = ExtractSkillsView()
    titles = JobTitle.objects.filter(name=joblist[0].lower())
    title = titles[0]
    (x1, x2, y1, y2) = extract.get_coordinates(maps, dist)
    jobs = JobPosting.objects.filter(location__lat__gte=x1, location__lat__lte=x2, location__lng__gte=y1, location__lng__lte=y2, job_title=title)
    extract.extract_skills(jobs,title,maps)


    



