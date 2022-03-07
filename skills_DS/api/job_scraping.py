import requests
from requests_futures.sessions import FuturesSession
from concurrent.futures import ThreadPoolExecutor
from bs4 import BeautifulSoup
from .models import Location, JobPosting, JobTitle

def get_jobs(position, location, num, country, remote, radius):
    main(position, location, num, country, remote, radius)
    return


def get_url(position,location, country, radius):
    if country == "CA":
        return f'https://ca.indeed.com/jobs?q={position}&l={location}&radius={radius}'
    else:
        return f'https://indeed.com/jobs?q={position}&l={location}&radius={radius}'

def get_record(page):
    card = BeautifulSoup(page, 'html.parser')

    if type(card.find(id='jobDescriptionText'))==type(None):
        description=""
    else:
        description = card.find(id='jobDescriptionText').text.strip()
        
    #print(detect(description))
    
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


def main(position, location, num, country, remote, radius):
    records = []
    url = get_url(position, location['name'], country, radius)
    i = 0
    while num > i:
        urls = []
        print(url)
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
            print(temp_Location)
            
            if(temp_Location==location['name'].split(" ")[0].lower()):
                print('https://ca.indeed.com' + card.get('href'))
                if(card.get('href') is not None):
                    urls.append('https://ca.indeed.com' + card.get('href'))
                    i+=1

        session = FuturesSession(executor=ThreadPoolExecutor(max_workers=len(urls)))
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36',
            'Content-Type': 'text/html',
        }
        reqs = [session.get(url, headers=headers) for url in urls]
        for req in reqs:
            resp = req.result()
            record = get_record(resp.content)
            if record is not None:
                records.append(record)
                
        try:
            url = 'https://ca.indeed.com' + soup.find('a', {'aria-label': 'Next'}).get('href')
        except AttributeError:
            break

    print(f"Successfully scraped {len(records)} jobs.")

    loc, created = Location.objects.get_or_create(name=location['name'].lower(), lat=location['lat'], lng=location['lng'])

    title, created = JobTitle.objects.get_or_create(name=position.lower())
    
    for record in records:
        obj, created = JobPosting.objects.get_or_create(title=record[0], company=record[1], is_remote=record[2], description=record[3], location=loc, job_title=title)




