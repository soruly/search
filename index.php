<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<link rel="icon" type="image/png" href="favicon.png">
<title><?php if(isset($_GET['q'])) echo $_GET['q'], ' - ' ?>Soruly's Search</title>
<style>
a{
  text-decoration:none;
  color:#66F;
}
a:hover{
  text-decoration:underline;
}
body{
  font-family:Arial;
  line-height:1.4em;
  padding:20px;
  font-size:12px;
}
form>input[type=text]{
  width:50%;
}
</style>
</head>
<body>
<form action="/" method="get">
<input type="text" name="q" autofocus value="<?php if(isset($_GET['q'])) echo $_GET['q'] ?>">
<input type="submit">
</form>
<?php
use Elasticsearch\ClientBuilder;

require 'vendor/autoload.php';

$dotenv = new Dotenv\Dotenv(__DIR__);
$dotenv->load();

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, "http://".$_ENV["ELASTICSEARCH_HOST"].":9200/_stats");
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
$res = curl_exec($curl);
$result = json_decode($res);
$doc_count = $result->_all->primaries->docs->count;
curl_close($curl);

echo "Database contain ".$doc_count." records.<br>\n";

if(isset($_GET['q'])){

  $params = array();
  $params['hosts'] = array (
    $_ENV["ELASTICSEARCH_HOST"]
  );

  $client = ClientBuilder::create()->setHosts([$_ENV["ELASTICSEARCH_HOST"]])->build();
  $from = isset($_GET['from']) ? intval($_GET['from']) : 0;
  $size = isset($_GET['size']) ? intval($_GET['size']) : 100;
  if($from < 0) $from = 0;
  if($size > 500) $size = 500;
  $params = array();
  $json = '{
    "from" : '.$from.', "size" : '.$size.',
      "query": {
        "bool": {
          "must": {
            "match": {
              "filename": {
                "query": "'.$_GET['q'].'",
                  "operator": "or"
}
}
},
  "should": [{
    "match": {
      "filename": {
        "query": "anime_new",
          "operator": "and",
          "boost": 0
}
}
}, {
  "match": {
    "filename": {
      "query": "music_new",
        "boost": 0
}
}
}]
}
}
}';
$params['index'] = ['files'];
$params['type']  = 'file';
if($_GET['q'] != '')
  $params['body'] = $json;
else
  $params['body'] = '{"from" : '.$from.', "size" : '.$size.'}';

$results = $client->search($params);
echo '<small>About ', $results['hits']['total'], ' results (', $results['took'] ,' miliseconds)', "</small><br>\n";

if(isset($_GET['from']))
  echo '<div><a href="?q=',$_GET['q'],'&from=',$from-$size,'">Prev</a></div>',"\n";
echo '<div style="text-align:right"><a href="?q=',$_GET['q'],'&from=',$from+$size,'">Next</a></div>',"\n";


foreach($results['hits']['hits'] as $result){
  if(path_has_link($result['_source']['filename']))
    echo '<a href="', path_to_url($result['_source']['filename']) ,'">', path_to_filename($result['_source']['filename']), "</a><br>\n";
  else
    echo path_to_filename($result['_source']['filename']), "<br>\n";
}
//print_r($results);

if(isset($_GET['from']))
  echo '<div><a href="?q=',$_GET['q'],'&from=',$from-$size,'">Prev</a></div>',"\n";
echo '<div style="text-align:right"><a href="?q=',$_GET['q'],'&from=',$from+$size,'">Next</a></div>',"\n";

}

function path_to_filename($path){
  $filename = $path;
  return dirname($path).'/'.basename($path);
}

function path_has_link($path){
  if(substr(path_to_url($path),0,2) == '//')
    return true;
  else
    return false;
}
function path_to_url($path){
  $url = $path;
  //$url = substr($url,0,strrpos($url,'/'));
  return $url;
}
?>
</body>
</html>
