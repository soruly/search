require("dotenv").config();

const fs = require("fs");
const { StringDecoder } = require("string_decoder");
const fetch = require("node-fetch");
const fastify = require("fastify")({
  logger: false,
  bodyLimit: 1024 * 1024 * 1024,
});

const PORT = 30000;

beforeAll(() => fastify.register(require("../app.js")).listen(PORT));

afterAll(() => fastify.close());

test("/", async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/`);
  expect(res.status).toBe(200);
  const html = await res.text();
  expect(html).toEqual(expect.stringContaining("results"));
  expect(html).toEqual(
    expect.stringContaining('<input type="text" name="q" autofocus value="" />')
  );
});

test("/update", async (done) => {
  const res = await fetch(`http://127.0.0.1:${PORT}/update`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: fs.createReadStream("test/list.txt", "utf8"),
  });
  let message = "";
  res.body.on("data", (chunk) => {
    const decoder = new StringDecoder("utf8");
    message = decoder.end(chunk);
  });
  res.body.on("end", async () => {
    console.log(message);
    expect(message).toEqual(expect.stringContaining("10001 records"));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    done();
  });
}, 30000);

test("/?q=foo", async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/?q=foo`);
  expect(res.status).toBe(200);
  const html = await res.text();
  expect(html).toEqual(expect.stringContaining("0 results"));
  expect(html).toEqual(
    expect.stringContaining('<input type="text" name="q" autofocus value="foo" />')
  );
});

test("/?from=50", async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/?from=50`);
  expect(res.status).toBe(200);
  const html = await res.text();
  expect(html).toEqual(expect.stringContaining("10001 results"));
});

test("/?q=foo&from=50", async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/?q=foo&from=50`);
  expect(res.status).toBe(200);
  const html = await res.text();
  expect(html).toEqual(expect.stringContaining("0 results"));
  expect(html).toEqual(
    expect.stringContaining('<input type="text" name="q" autofocus value="foo" />')
  );
});
