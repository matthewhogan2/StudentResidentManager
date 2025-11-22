<?php

//protect page users must log in
session_start();
if (!isset($_SESSION['username'])) 
{
    header("Location: login.php");
    exit();
}

include 'database.php';

//when edit page opens loads the student current information you can eidt changing details
if (isset($_POST['update'])) 
{
    $id=$_POST['id'];
    $name= $_POST['name'];
    $room= $_POST['room'];
    $email=$_POST['email'];

    $sql="UPDATE students SET name='$name', room_number='$room', email='$email' WHERE id='$id'";


    if ($conn->query($sql)=== TRUE) 
    {
        header("Location: view_students.php?message=updated");
        exit();
    } 
    else 
    {
        echo "Error updating student: " . $conn->error;
    }
}

// checking if edit page loaded normally
if (isset($_GET['id'])) 
{
    $id = $_GET['id'];

    $sql = "SELECT * FROM students WHERE id='$id'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) 
    {
        $student = $result->fetch_assoc();
    } 
    else 
    {
        echo "No student found!";
        exit();
    }
} 

else 
{
    echo "No ID specified!";
    exit();
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Edit Student - Residence Management</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>

<div class="form-container">

    <h1>Edit Student Details</h1>

    <form method="POST" action="edit_student.php" class="form-box">
        <input type="hidden" name="id" value="<?php echo $student['id']; ?>">
        <label for="name">Name:</label><br>
        <input type="text" id="name" name="name" value="<?php echo htmlspecialchars($student['name']); ?>" required><br><br>
        <label for="room">Room Number:</label><br>
        <input type="text" id="room" name="room" value="<?php echo htmlspecialchars($student['room_number']); ?>" required><br><br>
        <label for="email">Email:</label><br>
        <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($student['email']); ?>" required><br><br>
        <button type="submit" name="update" class="btn">Update Student</button>
    </form>

    <br>
    <a href="view_students.php" class="back-link">← Back to Student List</a>

</div>

</body>
</html>
