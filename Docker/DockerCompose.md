---
title: Orchestrating Docker containers with Docker Compose
nav_order: 4
parent: Docker
---

# Orchestrating Docker containers with Docker Compose

Docker containers can be run in one run using Docker Compose. More official documentation re. Docker Compose is available [here](https://docs.docker.com/compose/).

Here is a annotated example showing how a front-end, back-end and database are started up as Docker containers. Remember that port mappings are of the form [HOST port : CONTAINER port].

```yml
# This is intended to deploy the backend, front-end and MySQL database

# In the command prompt/console, navigate to the directory where this file is located and enter
# "docker-compose up"; run "docker-compose up -d" to run everything in the background (no console output)

# To shut-down gracefully, enter CTRL-C (for MACs use command . (period)) at the command prompt/console.

# Once running, check the images are pulled by typing "docker images" and the containers are working by typing "docker ps"

# Docker compose file format v3.7; this requires Docker v18.06.0 or higher
# type "docker --version" at the console to find out what version you are using and adjust the version
# below according to your version (see https://docs.docker.com/compose/compose-file/)
version: '3.7'

services:

  # this is the front-end
  booking-system-frontend:
    image: maxg19/booking-web:latest
    depends_on:
      # front-end will load after the back-end
      - booking-system-backend
    ports:
      - "3000:3000"

  # this is the back-end
  booking-system-backend:
    image: jfspps/booking-system:latest
      # backend will load after MySQL
    depends_on:
      - booking-system-mysql
    ports:
      # open localhost:5000 in a browser to access the welcome page with OpenAPI info
      - "5000:5000"
    environment:
      # note these are the sender's email address; if you have your own Gmail account, you can use that here;
      # you may need to enable/allow 'Less Secure apps' in Gmail
      EMAIL_USERNAME: btmDevGroup@gmail.com
      EMAIL_PASSWORD: passBOOK21
      EMAIL_FROM: btmDevGroup@gmail.com
      # the next section is all about the back-end database settings (note that containers connect by name: "booking-system-mysql" instead of "localhost")
      SPRING_DATASOURCE_URL: jdbc:mysql://booking-system-mysql:3306/booking_system_db
      # these are the back-end's database settings; make sure the usernames and passwords match
      SPRING_DATASOURCE_USERNAME: booking-system-user
      SPRING_DATASOURCE_PASSWORD: password_drowssap_password
      # this is important: run this script for the first time and set the following to "create"; when all is running, shutdown all containers
      # using CTRL-C (or command-period) and change this to "validate" without the quotes and re-run the script with "docker-compose up"
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
      LOGIN_PAGE: https://www.breakthemould.org.uk

  # this is the back-end database
  booking-system-mysql:
    image: mysql:8
    environment:
        # this identifies the name of the database; note the underscores and how it is used in the above datasource URL
      MYSQL_DATABASE: booking_system_db
        # Sets up a non-root user; change this to match the back-end mysql username
      MYSQL_USER: booking-system-user
        # Non-root user password; change this to match the back-end mysql password
      MYSQL_PASSWORD: password_drowssap_password
        # Password for root access; recommended to change this (not used by the back-end)
      MYSQL_ROOT_PASSWORD: password_drowssap
    ports:
        # host port : container port; if you want to connect to the back-end db with a db client then 
        # you'll need to connect to port 3307, not 3306
      - "3307:3306"
    volumes:
        # this connects the containers default MySQL directory to the Docker volume, below
      - book-sys-db:/var/lib/mysql

# MySQL data is stored in a Docker volume (managed in the background and caters for any operating system); 
# type "docker volume ls" at the console to get a list of Docker volumes on your host machine;
# this volume will be called "book-sys-db" and appear as "booking-system_book-sys-db" (image_volume)
volumes:
  book-sys-db:
```

The repo for the backend I wrote is available on [my GitHub account](https://github.com/jfspps/Activity-Booking-System-Backend).