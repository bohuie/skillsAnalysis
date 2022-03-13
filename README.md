## Table of contents

* [Setup](#setup)
  * [First time setup](#first-time-setup)
  * [Running the tech stack](#running-the-tech-stack)
* [Permissions](#permissions)

## Setup

A docker-compose file is provided to run the entire tech stack with Docker. This includes Django, React as well as PostgreSQL.

### First time setup

If you are running the project for the first time, a few setup steps need to be perform first. To start, you will need to have `docker` as well as `docker-compose` installed on your system. If you are using Windows, it is highly recommended that you install `Docker Desktop` directly.

After Docker is installed, we'll need to build the docker images for the project, to do so, open a console ad cd into the root directory of the project, then execute:

```console
docker-compose build
```

to build all necessary images. This will take ~3min but might take longer depends on network speed.

After that, in the same console window, execute:

```console
docker-compose up
```

to start all Docker containers. There **WILL** be errors. Ignore them for now. After all containers has been started and initialize, open Docker Desktop and navigate to `Containers/Apps -> skillsanalysis -> django  -> CLI`. A console window will show up. In it, execute:

```console
python manage.py migrate
```

This will initialize the database. After this is done, close the console window for Django. In the original console window where you started Docker, use `ctrl+c` to stop all of them.

The setup is now complete.

### Running the tech stack

After the setup, running the tech stack should be simple. Simply execute:

```console
docker-compose up
```

to start all containers. Then navigate to `localhost:8000` to view the webpage.

**Note: If you at any point added or removed any dependencies from React or Django, you will have to re-build the docker images. Follow the First time setup guide on how to build the images. If Django model is modified, you will have to re-initialize the database as well.**

## Permissions

This is a detailed table showing user & admin permissions on the platform.

| Permissions              | Description                                              |User|Admin|
| ------------------------ | --------------------------------------------------------------- |:-:|:-:|
| Registration             | Registering on the platform with ability to login/logout        | + | + |
| Upload resume            | Uploading resume to match jobs with similar skillset            | + | + |
| Resume skills extraction | Extract skills from uploaded resume                             | + | + |
| Edit skills              | Edit extracted skills from resume                               | + | + |
| Edit profile             | Edit user info and account permissions                          | - | + |
| View profile             | View user info and account permissions                          | - | + |
| Job scraping             | Fetch jobs from Indeed                                          | - | + |
| Job skills extraction    | Extract skills from scraped jobs                                | - | + |
