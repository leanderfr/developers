<?php
declare(strict_types=1);

header("Content-Type: text/html; charset=utf-8"); 

// headers that allows another url frontend making api calls to this backend
//  CORS = Cross-Origin Resource Sharing
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method,Access-Control-Request-Headers, Authorization");
header('Access-Control-Allow-Methods: POST, GET, DELETE, PUT, PATCH, OPTIONS');       

$method = $_SERVER['REQUEST_METHOD'];

// OPTIONS= browser sent just a signal to check out
if ($method == "OPTIONS") {
    header('Access-Control-Allow-Origin: *');
    header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method,Access-Control-Request-Headers, Authorization");
    header("HTTP/1.1 200 OK");
    die();
} 
header("HTTP/1.0 200 OK"); 


require 'setup.php';
require 'functions.php';
require __DIR__.'/vendor/autoload.php';
require "Router.php";
require "handlers/Expressions.php";  
require "handlers/Developers.php";  


//********************************************************************
// analyse the received route and points what to do
//********************************************************************
$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

// prepare handlers
$handlerExpressions = new Expressions;
$handlerDevelopers = new Developers;

$router = new Router;

$getRequest = $_SERVER['REQUEST_METHOD']==='GET';
$postRequest = $_SERVER['REQUEST_METHOD']==='POST';
$patchRequest = $_SERVER['REQUEST_METHOD']==='PATCH';
$deleteRequest = $_SERVER['REQUEST_METHOD']==='DELETE';

//*********************************************************************************************************************************************************
// get record(s)
if ($getRequest) {

  // resultformat =>  json , returns as an array of json,     reference, returns as a simple keyed array,  expressions.tablename, expresssions.title, etc
  // with searchbox
  $router->Get("/expressions/{resultformat}/{country}/{status}/{searchbox}", function($resultformat, $country, $status, $searchbox) use($handlerExpressions) {  
    $handlerExpressions->getExpressions($resultformat, $country, $status, $searchbox);
  });

  // no searchbox
  $router->Get("/expressions/{resultformat}/{country}/{status}", function($resultformat, $country, $status) use($handlerExpressions) {  
    $handlerExpressions->getExpressions($resultformat, $country, $status, '');
  });

  $router->Get("/expression/{id}", function($id) use($handlerExpressions)  {  
    $handlerExpressions->getExpressionById($id);
  });

  $router->Get("/developers/{status}/{searchbox}", function($status, $searchbox) use($handlerDevelopers) {  
    $handlerDevelopers->getDevelopers($status, $searchbox);
  });

  // no searchbox
  $router->Get("/developers/{status}", function($status) use($handlerDevelopers) {  
    $handlerDevelopers->getDevelopers($status, '');
  });

  $router->Get("/developer/{id}", function($id) use($handlerDevelopers)  {  
    $handlerDevelopers->getDeveloperById($id);
  });





}

//*********************************************************************************************************************************************************
// update record
if ($patchRequest) {
    $router->Patch("/expression/{id}", function($id) use($handlerExpressions)  {  
      $handlerExpressions->postOrPatchExpression($id);
    });

    $router->Patch("/expressions/status/{id}", function($id) use($handlerExpressions)  {  
      $handlerExpressions->ChangeStatus($id);
    });

    $router->Patch("/developer/{id}", function($id) use($handlerDevelopers)  {  
      $handlerDevelopers->postOrPatchDeveloper($id);
    });

    $router->Patch("/developer/status/{id}", function($id) use($handlerDevelopers)  {  
      $handlerDevelopers->ChangeStatus($id);
    });


}


//*********************************************************************************************************************************************************
// add record
if ($postRequest)  {
    $router->Post("/expression", function() use($handlerExpressions)  {  
      $handlerExpressions->postOrPatchExpression();
    });

    $router->Post("/developer", function() use($handlerDevelopers)  {  
      $handlerDevelopers->postOrPatchDeveloper();
    });

}


$router->dispatch($path);

//********************************************************************
//********************************************************************


?>