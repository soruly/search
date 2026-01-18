# search

[![License](https://img.shields.io/github/license/soruly/search.svg?style=flat-square)](https://github.com/soruly/search/blob/master/LICENSE)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/soruly/search/docker-image.yml?style=flat-square)](https://github.com/soruly/search/actions)
[![Docker](https://img.shields.io/docker/pulls/soruly/search?style=flat-square)](https://hub.docker.com/r/soruly/search)
[![Docker Image Size](https://img.shields.io/docker/image-size/soruly/search/latest?style=flat-square)](https://hub.docker.com/r/soruly/search)

Dead simple search engine for huge a text file (> 1 million lines), powered by elasticsearch.

Usually used to search for files by names if you have million of files in file system.

## Usage

### 1. Clone this repo

```bash
git clone https://github.com/soruly/search.git
```

### 2. Configure settings in .env

Copy .env.example to .env, update the PORT if you need to

### 3. Run docker compose

```bash
docker compose up -d
```

### 4. Start server

```bash
node server.js
```

Or with pm2

```bash
npm run start
```

### 5. Index your text file

For example, generate a filename list

```bash
find . > list.txt
```

Submit to server

```bash
curl -X POST -H "Content-Type: text/plain" --data-binary @list.txt http://127.0.0.1:PORT/update
```

Index update usually takes 15-30 seconds for 1 million records

Note: existing index would be wiped every time on update

### 6. Open the webpage

Now open the webpage http://127.0.0.1:PORT

## Scheduling update

You can schedule a cron job to periodically update the index

```
0 * * * * find . > list.txt && curl -X POST -H "Content-Type: text/plain" --data-binary @list.txt http://127.0.0.1:PORT/update
```
