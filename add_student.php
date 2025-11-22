<?php

//protect page users must log in

//code inserts user into the data base 
    
session_start();
if (!isset($_SESSION['username'])) 
{
    header("Location: login.php");
    exit();
}

include 'database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') 
{
    $name = $_POST['name'];
    $room = $_POST['room'];
    $email = $_POST['email'];

    $sql = "INSERT INTO students (name, room_number, email) VALUES ('$name', '$room', '$email')";

    if (mysqli_query($conn, $sql)) 
    {
        header("Location: view_students.php?message=added");
        exit();
    } 
    else 
    {
        echo "Error adding student: " . mysqli_error($conn);
    }
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Add Student - Residence Management</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>

<div class="form-container"> <!-- Reused css from login creates white box-->
    <h1>Add New Student</h1> 

    <form method="POST" action="add_student.php" class="form-box">
        <label for="name">Student Name:</label><br>
        <input type="text" id="name" name="name" required><br><br>

        <label for="room">Room Number:</label><br>
        <input type="text" id="room" name="room" required><br><br>

        <label for="email">Email:</label><br>
        <input type="email" id="email" name="email" required><br><br>

        <button type="submit" class="btn">Add Student</button>
    </form>

    <br>
    <a href="view_students.php" class="back-link">← Back to Student List</a>
</div>

</body>
</html>
