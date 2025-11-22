<?php
session_start();

if (!isset($_SESSION['username'])) 
{
    header("Location: login.php");
    exit();
}

include 'database.php'; 

if (isset($_GET['id']))//takes student id and deletes it
{
    $id = intval($_GET['id']);
    $sql ="DELETE FROM students WHERE id = $id";

    if (mysqli_query($conn, $sql)) 
    {
        header("Location: view_students.php?message=deleted");
        exit();//delete student

    } 
    else 
    {
        echo "Error deleting student: " . mysqli_error($conn);
    }
} 
else 
{
     echo "Invalid request.";
}
?>
