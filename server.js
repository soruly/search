import Fastify from "fastify";
import App from "./app.js";

const fastify = Fastify({
  logger: false,
  bodyLimit: 1024 * 1024 * 1024,
});

fastify
  .register(App)
  .listen(process.env.PORT, process.env.LISTEN)
  .then((address) => console.log(`server listening on ${address}`))
  .catch((err) => {
    console.log("Error starting server:", err);
    process.exit(1);
  });
