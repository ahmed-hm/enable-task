## Description

This is an application written in Nestjs, which is a framework for building efficient, scalable Node.js server-side applications. It uses modern JavaScript, is built with TypeScript and demos the use of Nestjs with MongoDB via Mongoose ODM, and it is a RESTful API.

## Installation

You only need docker and docker compose installed on your machine to run this application. If you don't have them installed, you can follow the instructions on the links below:

- [Install Docker](https://docs.docker.com/get-docker/)
- [Install Docker Compose](https://docs.docker.com/compose/install/)

## Environment Variables

The application uses environment variables to configure the database connection and various other settings. You need to create a `.env` file in the root directory of the project and copy the contents of the `.env.example` file into it. You can then change the values of the variables to suit your needs.

## Running the app

You can run the application with the following command in the root directory of the project:

```bash
$ docker-compose up
```

The application will be available at http://localhost:3000

## API Documentation

The API documentation is available at http://localhost:3000/docs

## Database

The application uses MongoDB as database. The database is automatically created when you run the application for the first time.

The application uses an in-memory database when running in development/test mode. This means that the database is destroyed when the application is stopped.

The application uses a persistent database when running in staging/production mode. This means that the database is not destroyed when the application is stopped.

## Seed Data

The application uses seed data to populate the database with some initial data. The seed data is automatically loaded when you run the application for the first time.
You can find the seed data in the `src/shared/seed/seed.json` file. You can change the seed data to suit your needs.

## Test

Tests are written with Jest and Supertest. They are automatically run when you build the application docker image. You can also run them manually with the following commands:

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```
