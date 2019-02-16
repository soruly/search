# search

Dead simple search engine for huge a text file (> 1 million lines), powered by elasticsearch. 

Usually used to search for files by names if you have million of files in file system.

## Prerequisites

- docker
- docker-compose
- Node.js 10+

## Usage

### 1. Clone this repo and install
```bash
git clone https://github.com/soruly/search.git
cd search
npm install
```

### 2. Configure settings in .env
Copy .env.example and rename to .env
```
ELASTICSEARCH_HOST=elasticsearch   # docker internal hostname, no need to change
ELASTICSEARCH_PORT=9201            # you can access elasticsearch from host
NODE_PORT=8001                     # web interface would listen to this port
FILE_LIST=/mnt/store/list.txt      # a huge text file to index
```

### 3. Run docker
```bash
docker-compose up -d
```

### 4. Prepare your huge text file
For example, generate a filename list
```bash
find /mnt/store/ > /mnt/store/list.txt
```

### 5. Index the file
```bash
curl http://127.0.0.1:8001/update
```
Index update usually takes 90 seconds for 2 million records

Now open the webpage http://127.0.0.1:8001

Note: existing index would be wiped everytime on update

## Scheduling update
You can schedule a cron job to periodically update the index
```
0 * * * * find /mnt/store/ > /mnt/store/list.txt && curl http://127.0.0.1:8001/update
```
