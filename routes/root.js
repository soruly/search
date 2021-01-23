module.exports = async function (fastify, opts) {
  const fetch = require("node-fetch");
  fastify.get("/", async function (request, reply) {
    const from = parseInt(request.query.from, 10) || 0;
    const size = 50;
    const json = request.query.q
      ? {
          from,
          size,
          query: {
            bool: {
              must: {
                match: {
                  filename: {
                    query: request.query.q,
                    operator: "or",
                  },
                },
              },
            },
          },
        }
      : { from, size };

    const results = await fetch(`${process.env.ELASTICSEARCH_ENDPOINT}/files/file/_search`, {
      method: "POST",
      body: JSON.stringify(json),
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.json());
    return reply.view("index.ejs", {
      q: request.query.q,
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
};
