<?php

$servername = "localhost";
$username ="root";
$password =""; //sql password admin
$database ="residence_manager";

$conn =new mysqli($servername, $username, $password, $database );

if ($conn->connect_error) 
{
    die("Connection failed: " . $conn->connect_error); //checks for database connection
}



?>
