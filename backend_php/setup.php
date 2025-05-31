
<?php

// database 
$server = 'autogestor.ckv6s00ampaj.us-east-1.rds.amazonaws.com';
$login = 'admin';
$password = "Sucesso123#";  
$database = 'hiring_machine';

// aws s3 access
$AWS_S3_APIKEY = 'AKIA5MSUBQX4PGLJV4NH';
$AWS_S3_SECRETKEY = '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';
$AWS_S3_BUCKET = 'devs-app';
$AWS_S3_IMAGES_FOLDER= 'hiring_machine';
$AWS_S3_URL = 'https://devs-app.s3.sa-east-1.amazonaws.com/hiring_machine/';

$LOCAL_TMP_FOLDER= '/tmp';

// show errors when developing
if ( strpos($_SERVER['HTTP_HOST'], 'localhost')!==false || strpos($_SERVER['HTTP_HOST'], '127.0.0.1')!==false ) {

  ini_set('display_errors', '1');
  ini_set('display_startup_errors', '1');
  error_reporting(E_ALL);

}
// dont in production 
else {  
  error_reporting(0);
  ini_set('display_errors', 0);
}

  
// share connection throghout the app 
$dbConnection = mysqli_connect($server, $login, $password);
if (mysqli_connect_errno())    {
    echo "Error connection database: " . mysqli_connect_error();
}

mysqli_select_db($dbConnection, $database) or die(mysqli_error($dbConnection));

mysqli_query($dbConnection, "SET NAMES 'utf8'");
mysqli_query($dbConnection,'SET character_set_connection=utf8');
mysqli_query($dbConnection,'SET character_set_client=utf8');
mysqli_query($dbConnection,'SET character_set_results=utf8');


?>