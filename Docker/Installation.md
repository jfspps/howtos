# Installing Docker #

This outlines how to install Docker to Linux Mint (Vera, v21). The instructions are obviously taken from the Docker [official instructions](https://docs.docker.com/engine/install/ubuntu/) but I repeat them here without all the other stuff.

```bash
sudo apt-get update
sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

Get the GPG (GNU Privacy Guard; confirms authenticity) key:

```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

Then install the engine:

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

At the time of writing (Jan 2023) it is possible that the above CDN does not have the release for Linux Mint Vera Stable so when performing ```sudo apt update``` prior to installation, the repository source will not be recognised. If this is the case, then I manually edit the Software Sources (usually under Linux Mint's "Administration" panel) and change the identifier "vera" to "jammy". This [page](https://linuxmint.com/download_all.php) may be helpful.

Update ```apt``` and install Docker:

```bash
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

The Docker daemon always runs as the OS' ```root``` user (see [here](https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user)) and only responds to this user or those who are permitted to use ```sudo```. To enable other users, we first create a group ```docker``` (which Docker on restart will recognise and thread access through; note that on installation of Docker, this may have already been initialised) and add the current OS user to the ```docker``` group. This then means the current OS' user does not need root access to use Docker.

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
```

To enable Docker at startup:

```bash
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
```

Conversely, to disable Docker at startup:

```bash
sudo systemctl disable docker.service
sudo systemctl disable containerd.service
```
