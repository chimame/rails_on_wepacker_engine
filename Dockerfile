FROM ruby:2.4.1-alpine

RUN apk update && apk upgrade && apk add --update --no-cache alpine-sdk tzdata sqlite sqlite-dev nodejs && npm install -g yarn
RUN mkdir /app
WORKDIR /app

ARG BUNDLE_OPTIONS

# bundle install
ADD Gemfile /app/Gemfile
ADD Gemfile.lock /app/Gemfile.lock
RUN bundle install -j4 ${BUNDLE_OPTIONS}
# yarn install
ADD package.json /app/package.json
ADD yarn.lock /app/yarn.lock
RUN yarn install

ADD . /app

EXPOSE  3000
