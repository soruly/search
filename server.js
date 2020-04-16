require("dotenv").config();
const fetch = require("node-fetch");
const Koa = require("koa");
const render = require("koa-ejs");
const bodyParser = require("koa-bodyparser");
const app = new Koa();

render(app, {
  root: __dirname,
  layout: false,
  viewExt: "ejs",
  cache: true,
  debug: false,
});

app.use(
  bodyParser({
    enableTypes: ["text"],
    textLimit: 1024 * 1024 * 1024,
  })
);

app.use(async ({ request, res, path }, next) => {
  if (path !== "/update") {
    await next();
    return;
  }
  const startTime = Date.now();
  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Transfer-Encoding": "chunked",
  });
  res.write("Remove existing index...\n");
  const resultDelete = await fetch("http://elasticsearch:9200/files", {
    method: "DELETE",
  }).then((response) => response.json());
  res.write(`${JSON.stringify(resultDelete)}\n`);

  res.write("Creating new index...\n");
  const result = await fetch("http://elasticsearch:9200/files", {
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
  res.write(`${JSON.stringify(result)}\n`);
  res.write("Reading filelist...\n");
  const fileList = request.body.split("\n");

  res.write("Indexing...\n");
  const asyncTask = async function* () {
    const bulkSize = 10000;
    let start = 0;
    let end = 0;
    while (start < fileList.length) {
      end = start + bulkSize;
      end = end > fileList.length ? fileList.length : end;
      const command = [];
      for (let i = start; i < end; i += 1) {
        command.push({ index: { _id: start + i + 1 } });
        command.push({ filename: fileList[start + i] });
      }
      const body = `${command.map((obj) => JSON.stringify(obj)).join("\n")}\n`;
      await fetch("http://elasticsearch:9200/files/file/_bulk", {
        method: "POST",
        body,
        headers: { "Content-Type": "application/x-ndjson" },
      }).then((respond) => respond.json());
      yield end;
      start = end;
    }
  };
  for await (const end of asyncTask()) {
    res.write(`${end}\n`);
  }
  res.write(
    `Index update took ${((Date.now() - startTime) / 1000).toFixed(
      2
    )} seconds for ${fileList.length} records\n`
  );
  res.end();
});

app.use(async (ctx, next) => {
  const from = parseInt(ctx.query.from, 10) || 0;
  const size = 50;
  const json = ctx.query.q
    ? {
        from,
        size,
        query: {
          bool: {
            must: {
              match: {
                filename: {
                  query: ctx.query.q,
                  operator: "or",
                },
              },
            },
          },
        },
      }
    : { from, size };

  const results = await fetch("http://elasticsearch:9200/files/file/_search", {
    method: "POST",
    body: JSON.stringify(json),
    headers: { "Content-Type": "application/json" },
  }).then((response) => response.json());

  await ctx.render("index", {
    q: ctx.query.q,
    results,
    prev: `?q=${ctx.query.q || ""}&from=${from - size < 0 ? 0 : from - size}`,
    next: `?q=${ctx.query.q || ""}&from=${from + size}`,
  });
});

app.listen(3000);
