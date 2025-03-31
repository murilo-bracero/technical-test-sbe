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

## Folder Structure

The service follows a module-based structure based on domains. I like to say that it's a simpler interpretation of DDD.

The root of the project contains the service entrypoint, `main.ts`, docker related files (`Dockerfile`, `docker-compose.yaml`), the `integration-test` and the `modules` folder. 

Inside `modules` folder you'll find all the domains that compose the service, technical or not. For example, `card`, `api`, `db`.

The root of the modules folder should contain common types, interfaces, models, etc. that are used by all domains, for example env.ts and logger.ts

Unit tests have the `.test.ts` suffix and are located along with their subject counterparts.

## Extending the System

### Add new games

The current structure of the `Card` model supports new games without code changes, but they need to follow a basic structure to be added:

- The dataset file should be a JSON file
- The dataset file should follow the pattern `gamename-cards.json`, e.g. `flesh-and-blood-cards.json`
- The dataset file should contain an array of cards,  e.g. `[{}, {}, {}, ...]`
- Each card should have at least 3 properties:
  - `name`: The name of the card
  - `id`: An unique identifier for the card
  - `rarity`: The rarity of the card

All other properties will be added as game-specific attributes inside of the `gameAttributes` field.

The `game` property will be populated based on the dataset file name. So for example, if the dataset file is `flesh-and-blood-cards.json`, the `game` property will be set to `flesh-and-blood`.

### Querying new games

The GET endpoint currently supports querying all required attributes (`id`, `name`, `rarity`), system generated fields (`game`) and game-specific attributes, inside of the `gameAttributes` field.

The only limitation is with nested attributes in `gameAttributes`, as they are not supported yet, but their implementation will be code-only and shouldn't be too hard.

### Indexing new attributes

This part deppends hardly on observability, from both the service and the database side.

At the moment, all required attributes have at least one kind of index, but the only fields from `gameAttributes` that have an index are `ink_cost` and `color` due to the fact that only lorcana and magic cards are being added.

New games can be added without any code change and the API will handle most of the fields, but indexes should be added manually in the `modules/db/index.ts` file, on the `createIndexes` function.

But again, this will depend on the requirements of the new game, how ofthen it is queried and the kind of attributes it has.

## API Capabilities

The API currently supports the following endpoints:

- GET `/api/v1/cards`: Returns a paged list of cards
  * Query parameters:
  - _page: The page number, defaults to 1
  - _size: The page size, defaults to 10, max 50
  - _search: A term to search for in the `name` field
  - game: The game to filter by. At the moment only `lorcana` and `mtg` are supported
  - rarity: The rarity to filter by, comma separated
  - gameAttributes: A key-value object with the game-specific attributes to filter by, e.g. `gameAttributes[color]=B`
    * gameAttributes supports comma-separated values, e.g. `gameAttributes[color]=B,R`, single values, e.g. `gameAttributes[color]=B` and ranges if the matching field is numeric, e.g. `gameAttributes[ink_cost][gt]=1&gameAttributes[ink_cost][lt]=5`.
    * Query ranges are inclusive, e.g. `gameAttributes[ink_cost][gt]=1&gameAttributes[ink_cost][lt]=5` will return cards with ink cost between 1 and 5.

The endpoint has a cache layer with a 15-minute TTL, but if you need an uncached response, set the header `Cache-Control` to `no-cache`.

## Disclaimers

Some funcions were added to simplify the functional evaluation of the code by the recruiter, and should be not used by any real service.

They are:

`modules/db/index.ts#clearCardsCollection`

`integration-test/api.test.ts#beforeAll` 

## Enhancement Proposals

- Add a `GET /api/v1/cards/:id` endpoint to get a single card by id

- Althrough the search capabilities of MongoDB are good enought for this sepecific exercise, it does not support typos, misspellings, or partial words, so a Search Database could be added and implemented in the future, for example Meilisearch or Elasticsearch.

- For this exercise, all datasets are store in the repository as JSON files, but the API could be extended to acess the files from a remote blob storage, e.g. AWS S3 or Google Cloud Storage, as well as support for different file formats, e.g. CSV.
