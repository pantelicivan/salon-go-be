# Nest.js Core (Skeleton) project

This repository contains some of the most used features and functionalities for a quick project startup.

List of **implemented** features:

- Basic authentication (OAuth 2.0)
- Social authentication
  - Facebook login
  - Google login
  - Apple login
  - GitHub login
  - LinkedIn login
- File management (S3)
- SMS messages (Twilio)
- Push notifications (Firebase)
- Emails
- Multilingualism (i18n)
- Caching (Redis)
- Database transactions
- Automatic API documentation (Swagger)
- Dockerisation

List of **planned** features:

- Testing

## API Documentation

API documentation can be found on the following [link](https://drive.google.com/drive/u/0/folders/1XCEp_YTwrte-THLR19mJISjoHWb58poY).

## Feature flags

The core project supports feature enabling through so called feature flags.

Currently supported feature flags can be found in the `.env.example`:

```
# Feature flags
RESIZE_BIG_IMAGES=false
CREATE_IMAGE_THUMBNAILS=false
```

In order to enable a feature, set the appropriate flag to true.

## Authentication

Basic authentication is implemented using OAuth 2.0 standard.

#### Role system

Role system and route protection is in place. Demo routes for route protection are:

```
GET /auth/admin
GET /auth/client
```

#### Authentication functionalities

The following functionalities have been implemented:

- Registration
- Social authentication (Facebook, Apple, Google)
- Login
- Refresh token
- Email verification
- Change/Forgot/Reset password
- Logout

For Apple authentication to work, the following env parameters should be set:

```
# Apple OAuth
APPLE_AUD=
```

## File management

Files are uploaded directly to S3 service through the backend.

Currently supported file types are: **images**, **videos**, **documents** and **audio files**

For this feature to work, the following env parameters should be set:

```
# AWS
AWS_KEY_ID=
AWS_KEY_SECRET=
AWS_REGION=
AWS_CDN=
AWS_S3_BUCKET_NAME=core
AWS_S3_BASE_PATH=uploads

# File upload
MAX_FILE_SIZE_IN_MB=50
```

Files are related to other entities through polymorphic relations based on [Laravel's practice](https://laravel.com/docs/8.x/eloquent-relationships#polymorphic-relationships).

In order to prevent S3 overload and spamming, a cronjob is scheduled to delete stale files every day. File is stale if it's not connected to any model for longer than a day.

If enabled, file management service will resize big images and create thumbnails for images. Find the configuration in the `.env.example` under the following keys and enable them if needed:

```
RESIZE_BIG_IMAGES=false
CREATE_IMAGE_THUMBNAILS=false
```

## SMS messages

Currently implemented SMS provider is [Twilio](https://www.twilio.com/docs/sms)

For this feature to work, the following env parameters should be set:

```
# TWILIO
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_SENDER=
```

## Push notifications

Currently implemented Push notifications provider is [Firebase](https://firebase.google.com/docs/cloud-messaging)

For this feature to work, the following env parameters should be set:

```
# Firebase
FIREBASE_TYPE=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
FIREBASE_AUTH_URI=
FIREBASE_TOKEN_URI=
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=
FIREBASE_CLIENT_X509_CERT_URL=
```

## Emails

For email feature to work, the following env parameters should be set:

```
# Email config
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
HOST_NAME=
SMTP_USER=
SMTP_PASS=
DEFAULT_FROM=
```

## Multilingualism

Multilingualism is implemented using [i18n](https://www.npmjs.com/package/i18n).

To affect API's locale and trigger translations provide the **_x-locale_** header in the requests.

Localisation files can be found under `src/infrastructure/i18n/{locale}` with the following structure:

- `dictionary.json` - Used to translate single words that can be used as arguments of a more complex sentence.
- `exception.json` - Used to translate error messages by their code. _(i18n-1)_
- `message.json` - Used to translate entire sentences.
- `success.json` - Used to translate success messages by their code. _(i18n-2)_
- `validation.json` - Used to translate validation error messages by their code. _(i18n-3)_

_**i18n-1**_

Each thrown error can be found under `.../static/results/*.errors.ts`. Each error is an `ErrorLike` object that contains a code and a fallback message. The code specified in the error will be used for path building to find the appropriate translation.

_**i18n-2**_

Each return success can be found under `.../static/results/*.success.ts`. Each success is an `SuccessLike` object that contains a code and a fallback message. The code specified in the success will be used for path building to find the appropriate translation.

_**i18n-3**_

Request validation can be found under `.../dtos/req/*.dto.ts`. Each validation rule should be provided with a `translationKey` that will be used for path building to find the appropriate translation.

## Caching

[Redis](https://redis.io/) is used for the cache store.

For this feature to work, the following env parameters should be set:

```
# Cache
CACHE_TTL=
CACHE_HOST=
CACHE_PORT=
CACHE_PASSWORD=
```

## Database

The core project is prepared for Postgres database, but can be easily adjusted for others.

**Version 4 UUID** is used for IDs.

Database **transactions** are implemented using the [typeorm-transactional](https://www.npmjs.com/package/typeorm-transactional).

### Postgres

It is required to create DB and schemas ('migration' and 'core') manually

```bash
# Setup db
$ psql -Udefault
# Create database user (Note: use a more complex password).
$ create user coreuser with encrypted password 'corepass';
# Create the database.
$ create database core;
# Grant privileges to the new user.
$ grant all privileges on database core to coreuser;
# Connect to the created database as the newly created user.
$ \c core coreuser
# Create schemas
$ create schema core;
$ grant all privileges on schema core to coreuser;
$ create schema migration;
$ grant all privileges on schema migration to coreuser;
# List schemas to verify
$ \dn
```

### DB Scripts

To create migrations provide the path to which migrations should be created:

```bash
$ yarn db:migrate:create src/database/migrations/example
# OR
$ yarn db:migrate:new src/database/migrations/example
```

Note that 'example' is the name of migration.

### Caching queries

Database queries can be cached by enabling the cache in the `.env` file:

```
# DATABASE_CACHING=true
```

Default driver for caching is `redis`, but this can be configured. Default TTL is 1000ms (1 second).

Caching will not apply to all queries by itself, but instead needs to be explicitly triggered for each query. For more information take a look at the [official docs](https://orkhan.gitbook.io/typeorm/docs/caching).

**Disable caching while formatting the database. The commands won't finish if caching is enabled.**

## ENV

Create `.env` file based on `.env.example`.

## Installation

You can either bootstrap the application step by step or use the Makefile to do the heavy lifting.

### Dependencies

NestJs v9 is incompatible with cache-manager v5 and cache-manager-redis-store v3 ([github-issue](https://github.com/dabroek/node-cache-manager-redis-store/issues/53)).
After dependencies update verify compatibility with v5 (or higher) or return to v4.

### Makefile - (Docker)

Execute the following command to setup everything that is needed for the application to run over docker.
(on Windows OS additional setups are necessary so that make commands from Makefile can be used in terminal, or use linux based terminals)

```bash
# Execute this command to setup the dev env
$ make bootstrap
```

Application will run automatically. This command should be only used once, when first starting the application.

Use the following command to list all of the available recipes for the making.

```bash
$ make help
```

### Step by step setup

Install the required packages using [yarn](https://yarnpkg.com/getting-started).

```bash
$ yarn install --frozen-lockfile
```

### Running the app localy

```bash
# development
$ yarn dev

# production mode
$ yarn build
$ yarn start:prod
```

### Running the app over docker

Make sure to adjust the hosts for the database and caching system in the `.env` file.

```
# DB
DATABASE_HOST=postgres
DATABASE_PORT=5432
...

# Cache
CACHE_HOST=redis
CACHE_PORT=6379
...
```

After the `.env` has been adjusted, build the docker containers using the following command:

```bash
$ docker-compose up -d
```

## Running tests

```bash
# e2e
$ yarn test:e2e
```

## Logs

Find combined and error logs under **_<rootDir>/logs_** directory.
