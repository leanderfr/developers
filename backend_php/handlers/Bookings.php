<?php

class Bookings
{

  //***************************************************************************************************************************************
  //***************************************************************************************************************************************
  public function getBookingsByCarIdAndPeriod(string $country, string $car_id, string $firstday, string $lastday): void   {

    if ($country!='brazil' && $country!='usa' )   routeError('country');
  	if (! is_numeric($car_id))   routeError('id');
 
    // generates random string to concatenate with the link to the car image and avoid browser cache 
    $tempLink = rand(10000,99999);

    // the date format depends on the country informed by the frontend
    $sql = " select bookings.driver_name,  bookings.car_id, concat('car_', cars.id, '.png?$tempLink') as car_image, " .
          " if('$country'='usa', date_format(pickup_datetime, '%m/%d %h:%i - %p'), date_format(pickup_datetime, '%d/%m - %H:%i')) as pickup_formatted,   " .
          " if('$country'='usa', date_format(dropoff_datetime, '%m/%d %h:%i - %p'), date_format(dropoff_datetime, '%d/%m - %H:%i')) as dropoff_formatted,   " .
          " date_format(pickup_datetime, '%Y-%m-%d|%H:%i') as pickup_reference,   date_format(dropoff_datetime, '%Y-%m-%d|%H:%i') as dropoff_reference, " .
          " bookings.id as booking_id ".
          " from bookings ".
          " left join cars on bookings.car_id = cars.id " .
          " where 1=1 ";

  // car_id = 0, frontend asks to list all cars reservations, no filter
	if ($car_id == '0') {		
	}
	// user defined which car to list
	if ($car_id != '0') {
		$sql .= " and bookings.car_id = $car_id ";
  }

  $sql .= " and (DATE_FORMAT(pickup_datetime,'%Y-%m-%d') between '$firstday' and '$lastday' or DATE_FORMAT(dropoff_datetime,'%Y-%m-%d') between '$firstday' and '$lastday') ";
  $sql .= " AND bookings.deleted_at IS null ";

   /*
    result example that will be sent to front
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
    */


    executeFetchQueryAndReturnJsonResult( $sql, false, false );
  }




  //***************************************************************************************************************************************
  //***************************************************************************************************************************************
  public function getBookingById(string $country, string $booking_id): void   {

    if ($country!='brazil' && $country!='usa' )   routeError();
  	if (! is_numeric($booking_id))   routeError();
  
    // generates random string to concatenate with the link to the car image and avoid browser cache 
    $tempLink = rand(10000,99999);

    // the date format depends on the country informed by the frontend
    $sql = " select bookings.driver_name,  bookings.car_id, concat('car_', cars.id, '.png?$tempLink') as car_image, " .
          " if('$country'='usa', date_format(pickup_datetime, '%m/%d/%y'), date_format(pickup_datetime, '%d/%m/%y')) as pickup_date,   " .
          " if('$country'='usa', date_format(dropoff_datetime, '%m/%d/%y'), date_format(dropoff_datetime, '%d/%m/%y')) as dropoff_date,   " .
          " if('$country'='usa', date_format(pickup_datetime, '%h:%i - %p'), date_format(pickup_datetime, '%H:%i')) as pickup_hour,   " .
          " if('$country'='usa', date_format(dropoff_datetime, '%h:%i - %p'), date_format(dropoff_datetime, '%H:%i')) as dropoff_hour,   " .
          " bookings.id as booking_id ".
          " from bookings ".
          " left join cars on bookings.car_id = cars.id " .
          " where bookings.id = $booking_id ";


    executeFetchQueryAndReturnJsonResult( $sql, true, false );
  }



  //***************************************************************************************************************************************
  //***************************************************************************************************************************************
  public function postOrPatchBooking($booking_id=''): void   {
    global $dbConnection;


    // verify request
    $fields = [ ['int', 'car_id', 1, 6]  ,  
                ['datetime', 'pickup_datetime', 5, 20]  ,
                ['datetime', 'dropoff_datetime', 5, 200]  ,
                ['string', 'driver_name', 3, 50] ];

    // if it is posting ($booking_id==''), get the usual $_POST from php
    if ($booking_id=='')    {
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

    $carId = $_FIELDS['car_id'];
    $pickupDatetime =   $_FIELDS['pickup_datetime'];
    $dropoffDatetime = $_FIELDS['dropoff_datetime'];
    $driverName = $_FIELDS['driver_name'];

    // check if there's already a booking between the times the user is trying to reserve and with the same car

    //  - INTERVAL 1 MINUTE / + INTERVAL 1 MINUTE   to the bookings being able to share the same threshold
    // car is reserved between 08 am and 4 pm and at the same time, reserved between 4 pm and 10 pm,  1 minute tolerance
    $sql =
        "select bookings.id ".
        " from bookings " .
        " where ".
        " ( '$pickupDatetime' between date_format(pickup_datetime + INTERVAL 1 MINUTE, '%Y-%m-%d %H:%i') and date_format(dropoff_datetime - INTERVAL 1 MINUTE, '%Y-%m-%d %H:%i') or " .
        "   '$dropoffDatetime' between date_format(pickup_datetime + INTERVAL 1 MINUTE, '%Y-%m-%d %H:%i') and date_format(dropoff_datetime - INTERVAL 1 MINUTE, '%Y-%m-%d %H:%i') or  " .
        "   date_format(pickup_datetime + INTERVAL 1 MINUTE, '%Y-%m-%d %H:%i') between '$pickupDatetime' and '$dropoffDatetime' or " .
        "   date_format(dropoff_datetime - INTERVAL 1 MINUTE, '%Y-%m-%d %H:%i') between '$pickupDatetime' and '$dropoffDatetime' ) " .
        " and " .
        "  bookings.car_id = $carId  " .
        ( $booking_id!='' ? " and bookings.id <> $booking_id   "  : ''  );

    try {
      $result = mysqli_query($dbConnection, $sql) or internalError('[1] Database error');    
    } catch(Exception $e)  {
      internalError( mysqli_error($dbConnection) );
    }
    if ( mysqli_num_rows($result) > 0 )  internalError('time_or_car_occupied');

  
    // if no ID's been informed, its a POST, new record
    if ($booking_id=='')    {
      $crudSql = "insert into bookings(car_id, pickup_datetime, dropoff_datetime, driver_name, created_at, updated_at) ". 
                "select $carId, '$pickupDatetime', '$dropoffDatetime', '$driverName', now(), now() "; 
      $dbOperation = 'insert';
    }

    // if ID's been informed, its a PATCH, update
    else {
      $crudSql = "update bookings set pickup_datetime='$pickupDatetime', dropoff_datetime='$dropoffDatetime', driver_name='$driverName', updated_at=now() ". 
                "where id = $booking_id ";
      $dbOperation = 'update';
    } 
    $dbConnection -> autocommit(true);    // record without need to transaction

    // execute query and get the ID of the just handled record (third param)
    $result = executeCrudQueryAndReturnResult($crudSql, true);    

    http_response_code(200);   // 200= it was ok
    if ($dbOperation == 'update')   die( '__success__' );
    else die( $result );    // __success__|id registro

  }



  //***************************************************************************************************************************************
  //***************************************************************************************************************************************
  public function deleteBooking($id=''): void   {
    global $dbConnection;


  	if (! is_numeric($id))   routeError();

    $crudSql = "update bookings set deleted_at=now() where id = $id ";
    $dbConnection -> autocommit(true);    // record without need to transaction

    $result = executeCrudQueryAndReturnResult($crudSql);    

    http_response_code(200);   // 200= it was ok
    die( '__success__' );
}

} 