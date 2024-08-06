# Install Operating system and dependencies
FROM ubuntu:20.04

RUN apt-get update 
RUN apt-get install -y curl -y
RUN apt-get install -y git -y
RUN apt-get install -y wget -y
RUN apt-get install -y unzip -y 
RUN DEBIAN_FRONTEND='noninteractive' apt-get install -y libgconf-2-4 -y 
RUN apt-get install -y gdb -y 
RUN apt-get install -y libstdc++6 -y 
RUN apt-get install -y libglu1-mesa -y 
RUN apt-get install -y fonts-droid-fallback -y 
RUN apt-get install -y lib32stdc++6 -y
RUN apt-get install -y python3 -y
RUN apt-get install -y python3-pip -y python3-venv -y
RUN apt-get clean

# Copy files to container and build
RUN mkdir /app/
COPY . /app/
WORKDIR /app/

# Record the exposed port
EXPOSE 8000

# make server startup script executable and start the web server
RUN ["chmod", "+x", "/app/server/server.sh"]

ENTRYPOINT [ "/app/server/server.sh"]