<?php
require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Factory\AppFactory;
use Slim\Routing\RouteCollectorProxy;
use Slim\Routing\RouteContext;

$app = AppFactory::create();

$app->addBodyParsingMiddleware();

// This middleware will append the response header Access-Control-Allow-Methods with all allowed methods
$app->add(function (Request $request, RequestHandlerInterface $handler): Response {
    $routeContext = RouteContext::fromRequest($request);
    $routingResults = $routeContext->getRoutingResults();
    $methods = $routingResults->getAllowedMethods();
    $requestHeaders = $request->getHeaderLine('Access-Control-Request-Headers');

    $response = $handler->handle($request);

    $response = $response->withHeader('Access-Control-Allow-Origin', '*');
    $response = $response->withHeader('Access-Control-Allow-Methods', implode(',', $methods));
    $response = $response->withHeader('Access-Control-Allow-Headers', $requestHeaders);

    // Optional: Allow Ajax CORS requests with Authorization header
    // $response = $response->withHeader('Access-Control-Allow-Credentials', 'true');

    return $response;
});

// The RoutingMiddleware should be added after our CORS middleware so routing is performed first
$app->addRoutingMiddleware();

$app->get('/', function (Request $request, Response $response, $args) {
    $newResponse = $response->withHeader('Content-type', 'application/json');
    $newResponse->getBody()->write(json_encode(['message' => 'Hello World!']));
    return $newResponse;
});

$app->post('/test', function (Request $request, Response $response, $args) {
    $data = $request->getParsedBody();
    $newResponse = $response->withHeader('Content-type', 'application/json');
    $newResponse->getBody()->write(json_encode($data));
    return $newResponse;
});


$app->options('/{routes:.+}', function (Request $request, Response $response, $args) {
    return $response;
});

$app->run();

// $uri = "mongodb://WarehouseManagerUser:password@mongodb:27017/WarehouseManager";

// $client = new Client($uri);

// try {
//     $database = $client->selectDatabase("WarehouseManager");
//     $collection = $database->selectCollection("test");
//     $collection->insertOne(["name" => "test"]);
// } catch (Exception $e) {
//     echo "Error: " . $e->getMessage();
// }

// phpinfo();
?>

