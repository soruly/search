require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs-extra");
const app = express();
const port = 3000;

const {ELASTICSEARCH_HOST} = process.env;

app.set("view engine", "pug");
app.get("/update", async (req, res) => {
  const startTime = Date.now();
  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Transfer-Encoding": "chunked"
  });
  res.write("Remove existing index...\n");
  const resultDelete = await fetch(`http://${ELASTICSEARCH_HOST}:9200/files`, {
    method: "DELETE"
  }).then((response) => response.json());
  res.write(`${JSON.stringify(resultDelete)}\n`);

  res.write("Creating new index...\n");
  const result = await fetch(`http://${ELASTICSEARCH_HOST}:9200/files`, {
    method: "PUT",
    body: JSON.stringify({
      settings: {
        index: {
          number_of_shards: 3,
          number_of_replicas: 0
        }
      }
    }),
    headers: {"Content-Type": "application/json"}
  }).then((response) => response.json());
  res.write(`${JSON.stringify(result)}\n`);
  res.write("Reading filelist...\n");
  const data = await fs.readFile("list.txt", "utf-8");
  const fileList = data.split("\n");

  res.write("Indexing...\n");
  const asyncTask = async function *() {
    const bulkSize = 10000;
    let start = 0;
    let end = 0;
    while (start < fileList.length) {
      end = start + bulkSize;
      end = end > fileList.length ? fileList.length : end;
      const command = [];
      for (let i = start; i < end; i += 1) {
        command.push({index: {_id: start + i + 1}});
        command.push({filename: fileList[start + i]});
      }
      const body = `${command.map((obj) => JSON.stringify(obj)).join("\n")}\n`;
      await fetch(`http://${ELASTICSEARCH_HOST}:9200/files/file/_bulk`, {
        method: "POST",
        body,
        headers: {"Content-Type": "application/x-ndjson"}
      }).then((respond) => respond.json());
      yield end;
      start = end;
    }
  };
  for await (const end of asyncTask()) {
    res.write(`${end}\n`);
  }
  res.write(`Index update took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds for ${fileList.length} records\n`);
  res.end();
});

app.get("/", async (req, res) => {
  const from = parseInt(req.query.from, 10) || 0;
  const size = 50;
  const json = req.query.q ? {
    from,
    size,
    query: {
      bool: {
        must: {
          match: {
            filename: {
              query: req.query.q,
              operator: "or"
            }
          }
        }
      }
    }
  } : {from,
    size};

  const results = await fetch(`http://${ELASTICSEARCH_HOST}:9200/files/file/_search`, {
    method: "POST",
    body: JSON.stringify(json),
    headers: {"Content-Type": "application/json"}
  }).then((response) => response.json());

  res.render("index", {
    q: req.query.q,
    results,
    prev: `?q=${req.query.q || ""}&from=${from - size < 0 ? 0 : from - size}`,
    next: `?q=${req.query.q || ""}&from=${from + size}`
  });
});

app.listen(port);

