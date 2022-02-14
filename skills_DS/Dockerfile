FROM python:3.9-buster

WORKDIR /app/django
COPY requirements.txt /app/django
COPY setup.sh /app/django

RUN apt update -y
RUN apt install dos2unix default-jdk -y

RUN pip3 install --upgrade pip setuptools wheel
RUN dos2unix setup.sh
RUN chmod +X ./setup.sh
RUN ./setup.sh

RUN pip3 install -r requirements.txt

EXPOSE 8000

CMD ["python", "manage.py", "runserver"]
