import path from "node:path";

import autoLoad from "@fastify/autoload";
import * as View from "@fastify/view";
import * as EJS from "ejs";

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
    dir: path.join(import.meta.dirname, "routes"),
    options: Object.assign({}, opts),
  });
}
