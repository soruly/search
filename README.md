# search

[![License](https://img.shields.io/github/license/soruly/search.svg?style=flat-square)](https://github.com/soruly/search/blob/master/LICENSE)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/soruly/search/Node.js%20CI?style=flat-square)](https://github.com/soruly/search/actions)

Dead simple search engine for huge a text file (> 1 million lines), powered by elasticsearch.

Usually used to search for files by names if you have million of files in file system.

## Prerequisites

- docker / podman
- docker-compose / podman-compose
- Node.js 10+

## Usage

### 1. Clone this repo and install

```bash
git clone https://github.com/soruly/search.git
cd search
npm install
```

### 2. Configure settings in .env

Copy .env.example and rename to .env, update the values as your need

### 3. Prepare your huge text file

For example, generate a filename list

```bash
find . > list.txt
```

### 4. Run docker

```bash
docker run -d --name=search -p 9201:9200 --restart always -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" elasticsearch:5-alpine
```

### 5. Index the file

```bash
curl -X POST -H "Content-Type: text/plain" --data-binary @list.txt http://127.0.0.1:8001/update
```

Index update usually takes 90 seconds for 2 million records

### 6. Start web server

```
node server.js
```

Now open the webpage http://127.0.0.1:8001

Note: existing index would be wiped everytime on update

## Scheduling update

You can schedule a cron job to periodically update the index

```
0 * * * * find . > list.txt && curl -X POST -H "Content-Type: text/plain" --data-binary @list.txt http://127.0.0.1:8001/update
```
