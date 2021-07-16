# search

[![License](https://img.shields.io/github/license/soruly/search.svg?style=flat-square)](https://github.com/soruly/search/blob/master/LICENSE)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/soruly/search/Node.js%20CI?style=flat-square)](https://github.com/soruly/search/actions)

Dead simple search engine for huge a text file (> 1 million lines), powered by elasticsearch.

Usually used to search for files by names if you have million of files in file system.

## Usage

### 1. Clone this repo

```bash
git clone https://github.com/soruly/search.git
```

### 2. Configure settings in .env

Copy .env.example to .env, update the PORT if you need to

### 3. Run docker-compose

```bash
docker-compose up -d
```

### 4. Prepare your huge text file

For example, generate a filename list

```bash
find . > list.txt
```

### 5. Index the file

```bash
curl -X POST -H "Content-Type: text/plain" --data-binary @list.txt http://127.0.0.1:8001/update
```

Index update usually takes 90 seconds for 2 million records

Note: existing index would be wiped everytime on update

### 6. Open the webpage

Now open the webpage http://127.0.0.1:PORT

## Scheduling update

You can schedule a cron job to periodically update the index

```
0 * * * * find . > list.txt && curl -X POST -H "Content-Type: text/plain" --data-binary @list.txt http://127.0.0.1:PORT/update
```
