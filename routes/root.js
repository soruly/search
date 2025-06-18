export default async function (fastify) {
  const { ES_HOST = "127.0.0.1", ES_PORT = 9200 } = process.env;
  fastify.get("/", async (request, reply) => {
    const from = Number.parseInt(request.query.from, 10) || 0;
    const size = 50;
    const json = request.query.q
      ? {
          from,
          size,
          track_total_hits: true,
          query: {
            match_phrase_prefix: {
              filename: {
                query: request.query.q,
                zero_terms_query: "all",
              },
            },
          },
        }
      : { from, size };

    const results = await fetch(`http://${ES_HOST}:${ES_PORT}/files/_search`, {
      method: "POST",
      body: JSON.stringify(json),
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.json());
    const { count } = await fetch(`http://${ES_HOST}:${ES_PORT}/files/_count`).then((response) =>
      response.json(),
    );
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
