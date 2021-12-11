# Job Skills Analysis Project
1. FinalVersion.ipny contains all the code of ML models: training, testing, and evaluation.
2. corpus.csv is the labelled dataset for training and testing.
3. COSC449.ipny are the functions that we use during the whole processing. Each section have a title to indicate the function:\
1)Scrapping Monster(Scrapping Job information from Monster)\
2)Scrapping From Indeed with Description of Jobs(Scrapping detailed Job information from Indeed)\
3)Finding Synonyms(Wordnet function for finding synonyms for word or phrase)\
4)Spacy Functions(Tokenization, POS Tagging, Lemmatization)\
5)Extracting Skills from the Database(Extracting phrases from local files)\
6)Database(Creating and Uploading job posting data to database)\
7)Extraction(Extract phrases from job descriptions that saved on the database)\
8)Word2Vec(function for Vectorization)\
9)Text Vectorization(function for Vectorization)
4. Data on OneDrive\
"JobTitles" folder and "software" folder include all the web scrapped data from indeed.com. Each excel file contains all the job posting information of the specific job title listed on the file name. In the file, pages represent different cities all over Canada. For each posting, it includes Job name, Job location, Company name, whether the job is Remote or not, and Job description. For job titles in the "JobTitles" folder, we choose one job title per sector in NAICS. For job titles in the "software" folder, we choose the top 10 job titles from “The Top 50 Software Job Titles [Ranked by What Candidates Search For]”(Kelly, 2019) for variations.
