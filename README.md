## User Service

This project is a comprehensive application built with the NestJS framework, a progressive Node.js framework for building efficient, reliable, and scalable server-side applications. The application is written in TypeScript, a statically typed superset of JavaScript that adds optional types.

## Description

This application provides a robust backend authentication and authorization service for a travel booking system. It interacts with other services such as hotel and flight booking, to ensure user notifications. The application uses Google OAuth2 for authentication and authorization, ensuring a secure and reliable user experience.

One of the key features of this application is the integration with RabbitMQ, a lightweight and reliable open source messaging system. When a user makes a booking through the hotel or flight service, a message is posted to RabbitMQ. The application listens for these messages and triggers an email notification to the user, informing them of their successful booking. Though this email functionality was currently implemented but on a free plan, hence can stop at anytime

The application uses MongoDB as its primary database. MongoDB is a source-available cross-platform document-oriented database program. Classified as a NoSQL database program, MongoDB uses JSON-like documents with optional schemas. MongoDB is developed by MongoDB Inc.

Prod URL: https://travel-app-user-service.onrender.com
Docs:

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
