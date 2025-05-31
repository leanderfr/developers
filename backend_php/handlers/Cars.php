<?php

class Cars
{

  //***************************************************************************************************************************************
  //***************************************************************************************************************************************
  
  public function getCars($status, $searchbox): void   {

    $sql =  "select description, concat('car_', id, '.png') as car_image, id, plate, ifnull(active, false) as active ".
            "from cars  ".
            "where deleted_at is null ";

    // priority is filter whatever came from the searchbox
    if ($searchbox!='')  {
      $sql .= "and trim(description) like trim('%$searchbox%')";
    } 

    // searchbox empty, filter by status
    else {

      if ($status=='active') $sql .= 'and ifnull(active, false)=true';
      else if ($status=='inactive') $sql .= 'and ifnull(active, false)=false';
      else if ($status=='all') $sql .= '';
      else $sql .= ' and 1=2';  // no status received
    }

    $sql .= ' order by description';

    executeFetchQueryAndReturnJsonResult( $sql, false);
  }

  //***************************************************************************************************************************************
  //***************************************************************************************************************************************

  public function getCarById($id): void   {
    $sql =  "select description, concat('car_', id, '.png') as car_image, id, plate, ifnull(active, false) as active ".
            "from cars  ".
            "where id=$id ";

    executeFetchQueryAndReturnJsonResult( $sql, true);
  }


  //***************************************************************************************************************************************
  //***************************************************************************************************************************************
  public function changeStatus($id): void   {
    global $dbConnection;


    if (! is_numeric($id)) {
      internalError( 'Not numeric' );
    }

    $crudSql = "update cars set active = if(active, false, true) where id = $id ";
    $dbConnection -> autocommit(true);    // record without need to transaction

    $result = executeCrudQueryAndReturnResult($crudSql, true);    

    http_response_code(200);   // 200= it was ok
    die( '__success__' );
  }



  //***************************************************************************************************************************************
  //***************************************************************************************************************************************
  public function postOrPatchCar($car_id=''): void   {
    global $dbConnection;

    // update doenst need the car id
  	if ($car_id!='' && ! is_numeric($car_id))   routeError();

    // verify request
    $fields = [ ['string', 'description', 5, 50]  ,
                ['string', 'plate', 5, 10] ];


    // if it is posting ($car_id==''), get the usual $_POST from php
    if ($car_id=='')    {
      $_FIELDS = $_POST;
    }

    // otherwise, use the PHP 8.4 request_parse_body() 
    else {
      [$_FIELDS, $_FILES] = request_parse_body();
    }

    $dataError = '';
    for ($i=0; $i < count($fields); $i++)  {

      $fieldType = $fields[$i][0];
      $fieldName = $fields[$i][1];
      $minSize = $fields[$i][2];
      $maxSize = $fields[$i][3];

      $fieldValue = $_FIELDS[$fieldName];

      // is numeric
      if ($fields[$i][0] == 'int') {
        if (! is_numeric($fieldValue)) {
          $dataError = 'Not numeric';
          break;
        }
      }

      // min / max sizes
      if ($fieldType=='string') {
          if ( strlen($fieldValue) < $minSize || strlen($fieldValue) > $maxSize )  {
            $dataError = $fieldName . ' - String size error';
            break;
          }
      }
    }

    if ($dataError!='') internalError( $dataError );

    $description =   addslashes($_FIELDS['description']);
    $plate = ($_FIELDS['plate']);

    // is image ok  
    // the front end already checked if the user chose an image when adding record, what's impeditive to go on
    // if the users didnt choose an image when updating record, bypass the image recording
    $bypassImage = true;
    if ( isset($_FILES['image']['tmp_name']) )  {
      $imgInfo = getimagesize($_FILES['image']['tmp_name']);

  //    if ($imgInfo === FALSE) 
  //      internalError( 'File erro');

      if ($imgInfo[2] !== IMAGETYPE_PNG) 
        internalError( 'Image must be PNG');

      if ($_FILES['image']['size'] > 1500000) 
        internalError( 'Max size 1.5 MB');

      $bypassImage = false;
    }    

    // if no ID's been informed, its a POST, new record
    if ($car_id=='')    {
      $crudSql = "insert into cars(description, plate, created_at, updated_at, active) ". 
                "select '$description', '$plate', now(), now(), true "; 
      $dbOperation = 'insert';
    }

    // if ID's been informed, its a PATCH, update
    else {
      $crudSql = "update cars set description='$description', plate='$plate', updated_at=now() ". 
                "where id = $car_id ";
      $dbOperation = 'update';
    }
    $dbConnection -> autocommit(true);    // record without need to transaction

    // execute query and get the ID of the just handled record
    $result = executeCrudQueryAndReturnResult($crudSql, true);    
    // if it was a POST, obtain the car id  (__success__|record id)
    if ($car_id=='') {
      $car_id = explode("|", $result)[1];
    }
    // uploads the image to AWS S3

    if (! $bypassImage)      {
      uploadImageToAWS_S3('image', $car_id);
    }

    http_response_code(200);   // 200= it was ok
    if ($dbOperation == 'update')   die( '__success__' );
    else die( $result );    // __success__|id registro

  }
}
