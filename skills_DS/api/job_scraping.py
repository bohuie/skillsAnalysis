import asyncio
from datetime import datetime
import requests
from bs4 import BeautifulSoup

def get_jobs(position, location, num):
	#asyncio.create_task(main(position, location, num))
	return


def get_url(position,location):
    return 'https://ca.indeed.com/jobs?q={position}&l={location}&radius=0'

def get_record(card):
    atag = card.h2.a
    job_title = atag.get('title')
    job_url = 'https://ca.indeed.com' + atag.get('href')
    
    page = requests.get(job_url)
    soup2 = BeautifulSoup(page.content, 'html.parser')

    if type(soup2.find(id='jobDescriptionText'))==type(None):
        description=""
    else:
        description = soup2.find(id='jobDescriptionText').text.strip()
        
    #print(detect(description))
    
    if type(card.find('span', 'company'))==type(None):
        company=""
    else:
        company = card.find('span', 'company').text.strip()
        
    
    if type(card.find('span', 'remote'))==type(None):
        isRemote = False
    else:
        isRemote = True
        
    job_summary = card.find('div', 'summary').text.strip()
    post_date = card.find('span', 'date').text
    today = datetime.today().strftime('%Y-%m-%d')
    try:
        job_salary = card.find('span','salaryText').text.strip()
    except  AttributeError:
        job_salary = ''
    
    record = (job_title, company, isRemote, description)
    #record = (job_title)
    
    return record

#extract the job data
def main(position, location, num):
    records = []
    url = get_url(position, location)
    
    for x in range(num):
        response = requests.get(url)
        print(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        cards = soup.find_all('div', 'jobsearch-SerpJobCard')
        print(len(cards))
        
        print(location)
    
        for card in cards:
            if type(card.find('span', 'location accessible-contrast-color-location'))!=type(None):
                job_location = card.find('span', 'location accessible-contrast-color-location').text
            elif type(card.find('div', 'location accessible-contrast-color-location'))!=type(None):
                job_location = card.find('div', 'location accessible-contrast-color-location').text
            else:
                job_location=''
            temp_Location = job_location.split(',')[0].lower()
            
            #print(job_location)
            
            if(temp_Location==location.lower() or temp_Location=='canada'):
                record = get_record(card)
                if record[3]!="":
                    #print(record)
                    record = record + (job_location,)
                    records.append(record)
        
        try:
            url = 'https://ca.indeed.com' + soup.find('a', {'aria-label': 'Next'}).get('href')
        except AttributeError:
            break

    print(f"Successfully scraped {len(records)} jobs.")

	#convert records to skills
	#save to database



