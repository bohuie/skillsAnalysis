FROM python:3.9-buster

WORKDIR /app/django
COPY requirements.txt /app/django
COPY setup.sh /app/django
COPY migrate.sh /app/django

RUN apt update -y
RUN apt install dos2unix default-jdk -y
RUN apt-get install -y cron

RUN pip3 install --upgrade pip setuptools wheel
RUN pip3 install -r requirements.txt

RUN dos2unix setup.sh migrate.sh
RUN chmod +x ./setup.sh
RUN chmod +x ./migrate.sh

RUN ./setup.sh

EXPOSE 8000

CMD ["python", "manage.py", "runserver"]
