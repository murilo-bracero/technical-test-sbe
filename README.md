# Generic Card Loader

## Requirements

To run the images:

- Docker or Docker Compose

Or to run the application locally:

- MongoDB 8.0.6
- NodeJS 22
- NPM

### Environment Variables

The following environment variables are required:

- DATABASE_HOST: Host of the MongoDB database
- DATABASE_PORT: Port of the MongoDB database
- DATABASE_USER: MongoDB user name
- DATABASE_PASSWORD: MongoDB user password

Optional environment variables:

- PORT: (Optional) The port to listen on. Defaults to 3000.
- LOG_LEVEL: (Optional) The log level to use. Defaults to "info".

## Running

The recommended way to run this application is through Docker Compose.

### Using Docker Compose

```bash
docker compose up --build -d
```

This will spin up a MongoDB container, a "mongodb-express" app to interact directly with the database, and the Card Loader app.

### Using Docker

To run it without docker compose, you'll need to deploy a MongoDB container first:

```bash
docker run --name mongodb -d -p 27017:27017 \
    -e MONGO_INITDB_ROOT_USERNAME=admin \
    -e MONGO_INITDB_ROOT_PASSWORD=database_adminpass854 \
    -e MONGO_INITDB_DATABASE=cards-database \
    mongo:8.0.6
```

Then, build and run the card-loader image:

```bash
docker build -t card-loader .

docker run --name card-loader -d -p 3000:3000 \
    -e DATABASE_HOST=host.docker.internal \
    -e DATABASE_PORT=27017" \
    -e DATABASE_USER=admin \
    -e DATABASE_PASSWORD=database_adminpass854 \
    card-loader
```

### Using NodeJS locally

This application depends on MongoDB, NodeJS and some environment variables described at the [Requirements](##Requirements) section, so you'll need to install them first.

Follow [This](https://www.mongodb.com/docs/manual/installation/) to install MongoDB and [This](https://nodejs.org/en/download) to install NodeJS.

Then, build and run the card-loader app:

```bash
npm install

npm run build

npm run start
```

In all ways, the app will run the load job on startup and list to port 3000, unless specified otherwise.

