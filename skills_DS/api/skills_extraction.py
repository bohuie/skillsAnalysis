from .models import Location, JobPosting, JobTitle, Skill
import re
import math
import nltk

nltk.download('stopwords')
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('wordnet')
nltk.download('words')

from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet

stop_words = set(stopwords.words("english"))
lemmatizer = WordNetLemmatizer()

custom_stopwords = []

def extract_skills(position, location, distance):
	titles = JobTitle.objects.filter(name=position.lower())
	if len(titles) == 0:
		raise Exception("There are no jobs in the database for the provided position.")
	title = titles[0]
	(x1, x2, y1, y2) = get_coordinates(location, distance)
	print(x1,x2,y1,y2)
	jobs = JobPosting.objects.filter(location__lat__gte=x1, location__lat__lte=x2, location__lng__gte=y1, location__lng__lte=y2, job_title=title)
	if len(jobs) == 0:
		raise Exception("Could not find any jobs in the provided location.")
	print(len(jobs))
	print("thats the len of jobs")

	freq = {}
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
				if word[0] not in stop_words and word[0] not in custom_stopwords and wordnet.synsets(word[0]):
					words.append(lemmatizer.lemmatize(word[0]))
					if word[1] == "NN":
						nouns.append(lemmatizer.lemmatize(word[0]))
			
			for i in range(len(words)-1):
				bigrams.append(f"{words[i]} {words[i+1]}")
			
			for bigram in bigrams:
				if bigram not in custom_stopwords:
					if bigram in freq:
						freq[bigram] += 1
					else:
						freq[bigram] = 1
			
			for noun in nouns:
				if noun in freq:
					freq[noun] += 1
				else:
					freq[noun] = 1
	
	skill_location, created = Location.objects.get_or_create(name=location['name'].lower(), lat=location['lat'], lng=location['lng'])

	for key, value in freq.items():
		if value > len(jobs):
			skill, created = Skill.objects.get_or_create(name=key, location=skill_location, job_title=title)
			skill.count += value
			skill.save()

	jobs.update(scraped=True)
	return

def get_coordinates(location, distance):
	dist = ((math.sqrt(2)/2) * distance)
	lat = dist/110.574
	lng = dist/(111.320*math.cos(math.radians(lat)))

	return (location['lat'] - lat,location['lat'] + lat,location['lng'] - lng,location['lng'] + lng)