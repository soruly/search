<?php
$time = time();

use Elasticsearch\ClientBuilder;

require 'vendor/autoload.php';

$client = ClientBuilder::create()->setHosts(['192.168.2.12'])->build();

$index = explode(".", gethostname())[0];

if ($client->indices()->exists(['index' => $index])) {
  $client->indices()->delete(['index' => $index]);
}

$params = [
  'index' => $index,
  'body' => [
    'settings' => [
      'number_of_shards' => 3,
      'number_of_replicas' => 0
    ]
  ]
];

$response = $client->indices()->create($params);

$file="./list.txt";

$params = [];
$linecount = 0;
$handle = fopen($file, "r");
while(!feof($handle)){
  $linecount++;
  $line = fgets($handle);

  $params['index'] = $index;
  $params['type']  = 'file';
  $params['body'][] = [
    'index' => [
      '_id' => $linecount
    ]
  ];

  $params['body'][] = [
    'filename' => $line
  ];
  if($linecount % 10000 == 0){
    echo $linecount,"\n";
    $ret = $client->bulk($params);
    $params = [];
  }
}
if($linecount % 10000 != 0){
  echo $linecount,"\n";
  $ret = $client->bulk($params);
  $params = [];
}
fclose($handle);
echo 'Index update took ', time() - $time, ' seconds', "\n";

?>
