FROM nodesource/node:wheezy
MAINTAINER Nadrieril "nadrieril@eleves.polytechnique.fr"

#ENV HTTP_PROXY http://kuzh.polytechnique.fr:8080
#ENV http_proxy http://kuzh.polytechnique.fr:8080
#ENV https_proxy http://kuzh.polytechnique.fr:8080

RUN npm install -g npm && \
    npm install -g bower gulp grunt

WORKDIR /app/client
ADD package.json /app/client/
RUN npm install
ADD .bowerrc /app/client/
ADD bower.json /app/client/
RUN bower install --allow-root

ADD . /app/client
RUN sed -i 's/\(APIURL.url\).\+$/\1 = "api";/' app/app.js && \
    gulp build

VOLUME /app/client/dist
CMD /bin/true
