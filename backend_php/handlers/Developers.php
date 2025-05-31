<?php

class Developers
{

  //***************************************************************************************************************************************
  //***************************************************************************************************************************************

  public function getDevelopers(string $status, string $searchbox): void   {

    $sql =  "select id, name, ifnull(active, false) as active ".
            "from developers  ".
            "where deleted_at is null ";

    // priority is filter the searchbox
    if ($searchbox!='')  {
      $sql .= "and trim(name) like('%$searchbox%')  ";
    } 

    // searchbox empty, filter by status
    else {
        if ($status=='active') $sql .= 'and ifnull(active, false)=true';
        else if ($status=='inactive') $sql .= 'and ifnull(active, false)=false';
        else if ($status=='all') $sql .= '';
        else $sql .= ' and 1=2';  // no status received
    }

    $sql .= ' order by name';
    executeFetchQueryAndReturnJsonResult( $sql, false, false );
  }

  //***************************************************************************************************************************************
  //***************************************************************************************************************************************

  public function getDeveloperById($id): void   {
    $sql =  "select name  ".
            "from developers  ".
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

    $crudSql = "update developers set active = if(active, false, true) where id = $id ";
    $dbConnection -> autocommit(true);    // record without need to transaction

    $result = executeCrudQueryAndReturnResult($crudSql, true);    

    http_response_code(200);   // 200= it was ok
    die( '__success__' );
  }



  //***************************************************************************************************************************************
  //***************************************************************************************************************************************
  public function postOrPatchDeveloper($developer_id=''): void   {
    global $dbConnection;

    // only method PATCH will worry about record id, method POST wont
  	if ($developer_id!='' && ! is_numeric($developer_id))   routeError();

    // verify request
    $fields = [ ['string', 'name', 5, 30] 
              ];

    // if it is posting ($developer_id==''), get the usual $_POST from php
    if ($developer_id=='')    {
      $_FIELDS = $_POST;
    }

    // otherwise, use the PHP 8.4 request_parse_body() 
    else {
      [$_FIELDS] = request_parse_body();
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

    $name =   addslashes($_FIELDS['name']);

    // if no ID's been informed, its a POST, new record
    if ($developer_id=='')    {
      $crudSql = "insert into developers(name, created_at, updated_at, active) ". 
                "select '$name', now(), now(), true "; 
      $dbOperation = 'insert';
    }

    // if ID's been informed, its a PATCH, update
    else {
      $crudSql = "update developers set name='$name', updated_at=now() ". 
                "where id = $developer_id ";
      $dbOperation = 'update';
    }
    $dbConnection -> autocommit(true);    // record without need to transaction

    // execute query and get the ID of the just handled expression
    $result = executeCrudQueryAndReturnResult($crudSql, true);    

    // if it was a POST, obtain the id  (__success__|record id)
    if ($developer_id=='') {
      $developer_id = explode("|", $result)[1];
    }

    http_response_code(200);   // 200= it was ok
    if ($dbOperation == 'update')   die( '__success__' );
    else die( $result );    // __success__|id registro

  }


}