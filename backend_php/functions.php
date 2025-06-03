<?php

use Aws\S3\S3Client;
use Aws\S3\Exception\S3Exception as S3;

//*********************************************************************************
// informs the received route is incorrect
//*********************************************************************************
function routeError($detail='') {
  http_response_code(500);     
  die('Error with the route= '.$detail);
}


//*********************************************************************************************************
// internal server error
//*********************************************************************************************************

function internalError($message = 'Internal Error') {
  http_response_code(500);   
  die( $message );
}




/*********************************************************************************************************
 fetch data and convert records into json (simplified or not)

 $simplifyJSON= true ==> simplifies JSON, will be like this example: 

    {
        "created_at": "26 / janeiro / 2025 - 21:41",
        "updated_at": "26 / janeiro / 2025 - 21:59",
        "workgroup": "Accomplished"
    }

 $simplifyJSON= false ==> JSON will be kept as an array of JSON, like this

  [
        {
            "booking_id": 56,
            "car_id": 1462,
            "pickup_formatted": "27/01 - 16:30",
            "pickup_reference": "2025-01-27|16:30",
            "dropoff_formatted": "28/01 - 11:30",
            "dropoff_reference": "2025-01-28|11:30",
            "driver_name": "Peter ",
            "car_image": "Accomplished_car_001462.png"
        },
        {
            "booking_id": 57,
            "car_id": 1462,
            "pickup_formatted": "30/01 - 11:45",
            "pickup_reference": "2025-01-30|11:45",
            "dropoff_formatted": "30/01 - 16:20",
            "dropoff_reference": "2025-01-30|16:20",
            "driver_name": "Liliana",
            "car_image": "Accomplished_car_001462.png"
        }
    ]

$toReturnExpressions = true 
    different treatment when returning expressions (english/portuguese)
    transforms json into associative json (item => expression), example:

  {"welcome":"Welcome, Visitor!","available_cars":"Available cars","odometer":"Odometer","itemmenu_main":"Home",...}

*********************************************************************************************************/

function executeFetchQueryAndReturnJsonResult($sql, $simplifyJSON=false, $toReturnExpressions=false) {

  global $dbConnection;
   
  try {
    $result = mysqli_query($dbConnection, $sql) or internalError('[1] Database error / Erro na base de dados');    

  } catch(Exception $e)  {
    internalError( mysqli_error($dbConnection) );
  }

  $anyData = mysqli_num_rows($result) > 0;

  // different treatment when returning expressions portuguese/english
  if ($toReturnExpressions)  {
    $expressions = array();

    while($row = mysqli_fetch_assoc($result))    {
      //$expressions[$row["item"]] =  htmlentities($row["expression"], ENT_COMPAT, 'UTF-8'); ;
      $expressions[$row["item"]] =  $row["expression"];
    }
    die( json_encode($expressions) );     
  }
  else {    
      // returns array of objects
      if (! $simplifyJSON)        {
          $json = array();

          // converte resultset em json para o front end
          while($row =mysqli_fetch_assoc($result))    {
            $json[] = $row;
          }
      }

      // returns simple json
      if ($simplifyJSON)   {
        $json = mysqli_fetch_array($result, MYSQLI_ASSOC);
      }
  }

  //********************************************************************************************
  // send data to frontend
  //********************************************************************************************
  http_response_code(200);   // 200= everything's ok

  if ($anyData)     {
      die( json_encode($json) );     
  }
  else   
    die( json_encode([]) );
}

//*********************************************************************************************************
// execute query to post or patch  (crud)
//*********************************************************************************************************

function executeCrudQueryAndReturnResult($sql, $needToReturnId = false  ) {
  global $dbConnection;

  try {
    mysqli_query($dbConnection, $sql) or internalError('[2] Database error');  

    $lastId = mysqli_query($dbConnection, "select LAST_INSERT_ID() as record_id" ) or internalError('[3] Database error');    
    if ($___lastID = mysqli_fetch_object($lastId))   $newRecordId = $___lastID->record_id;
    else internalError('[4] Database error');    

    http_response_code(200);   // 200= it was ok
    if ($needToReturnId) return "__success__|$newRecordId";
    else die( '__success__' );

  } catch(Exception $e)  {
    internalError( mysqli_error($dbConnection) );
  }
}


//***********************************************************************
// write car image file in the AWS S3 repository
//***********************************************************************
function uploadImageToAWS_S3($fileName, $prefixFileName)  {

  global $AWS_S3_APIKEY, $AWS_S3_SECRETKEY, $AWS_S3_BUCKET, $AWS_S3_IMAGES_FOLDER;

  // file name locally written 
  $localFile = "$prefixFileName.png";

  if (! move_uploaded_file( $_FILES[$fileName]['tmp_name'], "tmp/$localFile"))  
    internalError( "Image upload failed => tmp/$localFile");
  
  try {
    $s3Client = new S3Client([
        'region' => 'sa-east-1',
        'version' => 'latest',
        'suppress_php_deprecation_warning' => true,
        'credentials' => [
            'key' => $AWS_S3_APIKEY,
            'secret' => $AWS_S3_SECRETKEY
        ]
    ]);
 
} catch(S3 $e) {
    die('err='. $e->getMessage());
 }

  try {
      $result = $s3Client->putObject([
        'Bucket' => $AWS_S3_BUCKET,
        'Key'    => "$AWS_S3_IMAGES_FOLDER/$localFile",
        'Body'   => fopen("tmp/$localFile", 'r'),

      ]);
  }
  catch (S3 $e) {
      internalError( $e->getMessage() );
  }

}



?>