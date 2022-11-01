#########
# Dockerfile that can be used for local development
########
FROM node:16-alpine

RUN apk --no-cache add openjdk11-jre bash && \
    npm install -g firebase-tools@11.13.0 && \
    firebase setup:emulators:firestore && \
    firebase setup:emulators:storage && \
    firebase setup:emulators:ui && \
    firebase setup:emulators:pubsub

USER node
ENV HOME=/home/node/.user
WORKDIR /home/node
CMD /bin/bash
