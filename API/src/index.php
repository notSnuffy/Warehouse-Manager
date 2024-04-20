<?php
require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

$uri = "mongodb://WarehouseManagerUser:password@mongodb:27017/WarehouseManager";

$client = new Client($uri);

try {
    $database = $client->selectDatabase("WarehouseManager");
    $collection = $database->selectCollection("test");
    $collection->insertOne(["name" => "test"]);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

echo "Hello world!!";

phpinfo();
?>

