---
title: Building images from Dockerfiles
nav_order: 3
parent: Docker
---


# Building images from Dockerfiles

A [Dockerfile](https://docs.docker.com/build/) is a text file that defines how to build Docker images:

```docker
FROM centos 
RUN yum install -y java-11-openjdk-devel 
VOLUME /tmp 
ADD /spring-boot-web-0.0.1-SNAPSHOT.jar myApp.jar 
RUN sh -c 'touch /myApp.jar' 
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/myApp.jar"]
```

Typically the Dockerfile (note the case: it is "Dockerfile" not "DockerFile" or some other variant) starts by downloading the first layer from [Docker Hub](https://hub.docker.com/), directed by the ```FROM``` command, as a CentOS distro. 

The remaining commands are optional.

The command ```RUN``` command executes the Bash command within the container OS (i.e. CentOS), which in this case installs the JDK 11 libraries. 

The command ```VOLUME``` prepares a mount point (to the host or other container directory) usually for non-OS binaries, in this case Tomcat, running on the image. The native host directory is always declared at container run-time and not defined anywhere in a Dockerfile. ```/tmp``` is from the point of view of the container. For more about Docker volumes, see [here](https://docs.docker.com/storage/volumes/).

The ```ADD``` command adds the first file, ```spring-boot-web-0.0.1-SNAPSHOT.jar```, to the container, renaming it as ```myApp.jar```. 

Another RUN command executes more bash commands. ```sh -c``` runs Bourne shell command (```-c``` from a string command). The JAR file timestamps are updated using ```touch```.

Then ```ENTRYPOINT``` represents the bash command which that is executed at start-up, with its parameters clearly separated by whitespace as string fragments. In this case, the command would be ```java -Djava.security.egd=file:/dev/./urandom -jar /myApp.jar```, which helps Tomcat run efficiently (go <a href="https://spring.io/guides/topicals/spring-boot-docker">here</a> for more info).

Overall, a new layer is built on top of the JVM. In the current directory (```.```) where the Dockerfile resides:

```
docker build -t spring-boot-docker .
```

After build completion, the new image is ```spring-boot-docker```. Then run the new image:

```
docker run -d -p 8080:8081 spring-boot-docker
```

The parameter ```-d``` runs the container in the background and ```-p``` maps the host port (8080) to the container port (8081).