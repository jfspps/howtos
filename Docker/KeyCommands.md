#  Docker commands

Below are lists of commonly used commands. More comprehensive reference material is provided by the [official documentation](https://docs.docker.com/reference/).

## Docker image tags

A note on [Docker tag names](https://docs.docker.com/engine/reference/commandline/tag/). 

When pulling and pushing images from Docker Hub, the tag name usually takes the form of 

```
dockerHubUsername/imageTagName:version
```

where ```version``` can be a string literal e.g. ```1.0.1-test```.

When pushing or pulling from a private repository, the tag name should be preceded by the registry hostname and (if needed) port:

```
yourRegistryHostname:5000/dockerImageTag:version
```

### Docker repository related commands

+ Log in to your Docker Hub account (required prior to image upload): ```docker login --username=yourDockerHubusername```
+ In the current directory (```.```) where the [Dockerfile](../Docker/Dockerfiles.md) resides, build and tag with: ```docker build -t imageTagName .```
+ Push images to Docker Hub: ```docker push imageTagName```
+ Pull Docker image: ```docker pull dockerHubImageTag```

# Summary of key commands

## Image related commands

+ List all (-a) Docker images: ```docker images -a```
+ Remove a Docker image (forced with -f): ```docker rmi -f image_name```
+ Delete all dangling Docker images (-a to remove unreferenced images): ```docker image prune -a```
+ Run a Docker image (initialise a Docker container) (-d as a daemon): ```docker -d run imageID```
+ Tag a Docker image (alternative to using Image IDs): ```docker tag imageID imageTagname```
+ Save Docker images locally as a tape archive or tarball (tar): ```docker save imageTagName > filename.tar```
+ Load an image from an archive (tar): ```docker load filename.tar```

## Container related commands

+ List all running Docker containers: ```docker ps```
+ List all Docker containers: ```docker ps -a```
+ Start a Docker container: ```docker start container_name```
+ Stop (graceful) a Docker container: ```docker stop container_name```
+ Restart a Docker container: ```docker container restart container_name```
+ Kill a running containers: ```docker container kill container_name```
+ Open a BASH shell in a container: ```sudo docker exec -it container_name bash```
+ View the logs of a Running Docker Container: ```docker logs container_name```
+ Remove a stopped container: ```docker rm container_name```
+ Remove all stopped containers (optional -f to force without confirmation): ```docker container prune -f```
+ Display a live stream of containers' resource usage stats: ```docker stats containerName```

## Volume related commands

+ Remove a volume (forced with f): ```docker volume rm -f volume_id```
+ Remove all unused volumes (no confirmation with -f): ```docker volume prune -f```

More on Docker volumes is given [here](https://docs.docker.com/storage/volumes/).