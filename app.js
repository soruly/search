import "dotenv/config.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import autoLoad from "@fastify/autoload";
import * as View from "@fastify/view";
import * as EJS from "ejs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function (fastify, opts) {
  fastify.register(View, {
    engine: {
      ejs: EJS,
    },
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  // fastify.register(AutoLoad, {
  //   dir: "plugins",
  //   options: Object.assign({}, opts),
  // });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(autoLoad, {
    dir: path.join(__dirname, "routes"),
    options: Object.assign({}, opts),
  });
}
