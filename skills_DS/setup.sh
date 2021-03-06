pip3 install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-2.3.1/en_core_web_sm-2.3.1.tar.gz

# spaCy
python3 -m spacy download en_core_web_sm

# nltk
python3 -m nltk.downloader stopwords
python3 -m nltk.downloader words
python3 -m nltk.downloader punkt
python3 -m nltk.downloader averaged_perceptron_tagger
python3 -m nltk.downloader universal_tagset
python3 -m nltk.downloader wordnet
python3 -m nltk.downloader brown
python3 -m nltk.downloader maxent_ne_chunker
python3 -m nltk.downloader omw-1.4