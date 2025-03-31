import { GenericContainer } from "testcontainers";

let teardownHappened = false;

export async function setup() {
  const mongodbContainer = await new GenericContainer("mongo:8.0.6")
    .withExposedPorts(27017)
    .withEnvironment({
      MONGO_INITDB_ROOT_USERNAME: "admin",
      MONGO_INITDB_ROOT_PASSWORD: "database_adminpass854",
      MONGO_INITDB_DATABASE: "cards-database",
    })
    .start();

  process.env.DATABASE_HOST = mongodbContainer.getHost();
  process.env.DATABASE_PORT = `${mongodbContainer.getMappedPort(27017)}`;
  process.env.DATABASE_USER = "admin";
  process.env.DATABASE_PASSWORD = "database_adminpass854";

  return async () => {
    if (teardownHappened) {
      throw new Error("teardown called twice");
    }

    teardownHappened = true;
    await mongodbContainer.stop();
  };
}
