import fetch from "node-fetch";

const { ELASTICSEARCH_HOST = "127.0.0.1", ELASTICSEARCH_PORT = 9200 } = process.env;

export default async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    const from = parseInt(request.query.from, 10) || 0;
    const size = 50;
    const json = request.query.q
      ? {
          from,
          size,
          query: {
            match: {
              filename: {
                query: request.query.q,
              },
            },
          },
        }
      : { from, size };

    const results = await fetch(
      `http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/files/_search`,
      {
        method: "POST",
        body: JSON.stringify(json),
        headers: { "Content-Type": "application/json" },
      },
    ).then((response) => response.json());
    const { count } = await fetch(
      `http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/files/_count`,
    ).then((response) => response.json());
    return reply.view("index.ejs", {
      q: request.query.q,
      count,
      results: results.error
        ? {
            took: 0,
            hits: {
              total: 0,
              hits: [],
            },
          }
        : results,
      prev: `?q=${request.query.q || ""}&from=${from - size < 0 ? 0 : from - size}`,
      next: `?q=${request.query.q || ""}&from=${from + size}`,
    });
  });
}
