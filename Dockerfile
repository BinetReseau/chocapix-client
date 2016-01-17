FROM nodesource/node:wheezy
MAINTAINER Nadrieril "nadrieril@eleves.polytechnique.fr"

#ENV HTTP_PROXY http://kuzh.polytechnique.fr:8080
#ENV http_proxy http://kuzh.polytechnique.fr:8080
#ENV https_proxy http://kuzh.polytechnique.fr:8080

RUN npm install -g npm && \
    npm install -g bower gulp grunt

RUN mkdir /app
WORKDIR /app
ADD package.json /app/
RUN npm install
ADD .bowerrc /app/
ADD bower.json /app/
RUN bower install --allow-root

ADD . /app
RUN sed -i 's/\(APIURL.url\).\+$/\1 = "api";/' app/app.js && \
    sed -i 's/\(OFFURL.url\).\+$/\1 = "off";/' app/app.js && \
    gulp build

VOLUME /srv/client
CMD rm -r /srv/client/*; \
    cp -TR /app/dist /srv/client
