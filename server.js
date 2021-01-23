require("dotenv").config();

const fastify = require("fastify")({
  logger: false,
  bodyLimit: 1024 * 1024 * 1024,
});

fastify
  .register(require("./app.js"))
  .listen(process.env.NODE_PORT, "127.0.0.1")
  .then((address) => console.log(`server listening on ${address}`))
  .catch((err) => {
    console.log("Error starting server:", err);
    process.exit(1);
  });
