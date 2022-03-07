## Instructions

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

to start all Docker containers. There **WILL** be errors. Ignore them for now. After all containers has been started and initialize, open Docker Desktop and navigate to `Containers/Apps -> skillsanalysis -> django -> CLI`. A console window will show up. In it, execute:

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

## Custom Admin Functionality

### Get Skills

On the get skills page, admin users can input data for scraping jobs and extracting skills.
First, you pick a job position, location, and fetch a number of jobs. There is currently no code to handle rejection by indeed other than just failing, so this number cannot be too high. Once some jobs have been scraped, you can select the same job position and location to extract all of the skills. The skills won't be perfect though, and will require manual review.

### Review Skills

The review skills page gives a nice table to sort skills as valid, invalid, or invalid for specific job. Submitting the table will fetch a new list of skills to review. Once a skill has been reviewed, it will never have to be reviewed again. If there is ever a mistake when reviewing skills, it will always be possible to fix it later through the default django object edit page.
