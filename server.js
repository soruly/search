import Fastify from "fastify";
import App from "./app.js";

process.loadEnvFile();

const fastify = Fastify({
  logger: false,
  bodyLimit: 1024 * 1024 * 1024,
});

fastify
  .register(App)
  .listen({ port: process.env.PORT || 3000, host: "::" })
  .then((address) => console.log(`server listening on ${address}`))
  .catch((err) => {
    console.log("Error starting server:", err);
    process.exit(1);
  });
