FROM node:10-alpine

# Install ffmpeg
RUN apk add --no-cache ffmpeg

# Create app directory
RUN mkdir -p /home/node/wai
WORKDIR /home/node/wai

# Install dependencies
ADD package.json .
RUN npm install

# Bundle app source
ADD . .

# Exports
EXPOSE 8000
CMD [ "npm", "run", "start" ]
