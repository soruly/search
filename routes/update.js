export default async function (fastify) {
  const { ES_HOST = "127.0.0.1", ES_PORT = 9200 } = process.env;
  fastify.post("/update", async (request, reply) => {
    const startTime = Date.now();
    reply.raw.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });
    reply.raw.write("Remove existing index...\n");
    const resultDelete = await fetch(`http://${ES_HOST}:${ES_PORT}/files`, {
      method: "DELETE",
    }).then((response) => response.json());
    reply.raw.write(`${JSON.stringify(resultDelete)}\n`);

    reply.raw.write("Creating new index...\n");
    const result = await fetch(`http://${ES_HOST}:${ES_PORT}/files`, {
      method: "PUT",
      body: JSON.stringify({
        settings: {
          index: {
            number_of_shards: 3,
            number_of_replicas: 0,
          },
        },
      }),
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.json());
    reply.raw.write(`${JSON.stringify(result)}\n`);
    reply.raw.write("Reading filelist...\n");
    const fileList = request.body.split("\n");

    reply.raw.write("Indexing...\n");
    const asyncTask = async function* () {
      const bulkSize = 10000;
      let start = 0;
      let end = 0;
      while (start < fileList.length) {
        end = start + bulkSize;
        end = end > fileList.length ? fileList.length : end;
        let body = "";
        for (let i = start; i < end; i += 1) {
          body += `${JSON.stringify({
            index: { _index: "files", _id: i + 1 },
          })}\n`;
          body += `${JSON.stringify({
            filename: fileList[i],
          })}\n`;
        }
        await fetch(`http://${ES_HOST}:${ES_PORT}/_bulk`, {
          method: "POST",
          body,
          headers: { "Content-Type": "application/x-ndjson" },
        }).then((respond) => respond.json());
        yield end;
        start = end;
      }
    };
    for await (const end of asyncTask()) {
      reply.raw.write(`${end}\n`);
    }
    reply.raw.write(
      `Index update took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds for ${
        fileList.length
      } records\n`,
    );
    reply.raw.end();
  });
}
