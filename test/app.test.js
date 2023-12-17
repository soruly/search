import fs from "node:fs/promises";
import Fastify from "fastify";
import App from "../app.js";

const fastify = Fastify({
  logger: false,
  bodyLimit: 1024 * 1024 * 1024,
});

const PORT = 30000;

beforeAll(() => fastify.register(App).listen({ port: PORT, host: "0.0.0.0" }));

afterAll(() => fastify.close());

test("/", async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/`);
  expect(res.status).toBe(200);
  const html = await res.text();
  expect(html).toEqual(expect.stringContaining("results"));
  expect(html).toEqual(
    expect.stringContaining('<input type="text" name="q" autofocus value="" />'),
  );
});

test("/update", async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/update`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: (await fs.open("test/list.txt")).createReadStream({ encoding: "utf8" }),
    duplex: "half",
  });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let result = await reader.read();
  let message = "";
  while (!result.done) {
    message += decoder.decode(result.value);
    result = await reader.read();
  }
  console.log(message);
  expect(message).toEqual(expect.stringContaining("10001 records"));
  await new Promise((resolve) => setTimeout(resolve, 1000));
}, 30000);

test("/?q=foo", async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/?q=foo`);
  expect(res.status).toBe(200);
  const html = await res.text();
  expect(html).toEqual(expect.stringContaining("0 results"));
  expect(html).toEqual(
    expect.stringContaining('<input type="text" name="q" autofocus value="foo" />'),
  );
});

test("/?from=50", async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/?from=50`);
  expect(res.status).toBe(200);
  const html = await res.text();
  expect(html).toEqual(expect.stringContaining("10001 documents"));
});

test("/?q=foo&from=50", async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/?q=foo&from=50`);
  expect(res.status).toBe(200);
  const html = await res.text();
  expect(html).toEqual(expect.stringContaining("0 results"));
  expect(html).toEqual(
    expect.stringContaining('<input type="text" name="q" autofocus value="foo" />'),
  );
});
