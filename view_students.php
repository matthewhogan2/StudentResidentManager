<?php

//protect page users must log in
session_start();
if (!isset($_SESSION['username'])) 
{
    header("Location: login.php");
    exit();
}


//
//looks at all student from the database

include 'database.php';

$sql = "SELECT * FROM students";
$result = mysqli_query($conn, $sql);

//success message
$message = '';

if (isset($_GET['message'])) 
{
    if ($_GET['message']=='updated') 
    {
        echo '<div id="success-message" class="alert-success">Student updated successfully!</div>';
    } 
    elseif ($_GET['message']=='deleted') 
    {
        echo '<div id="success-message" class="alert-success">Student deleted successfully!</div>';
    }
    elseif ($_GET['message'] =='added') 
    {
        echo '<div id="success-message" class="alert-success">Resident added successfully!</div>';
    }
}

//html displays table
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Residence Management</title>
    <link rel="stylesheet" href="assets/style.css">
</head>

<script>

  setTimeout(function() 
  {
    var message = document.getElementById('success-message');

    if (message) 
    {
      message.style.display='none';
    }

  }, 3000); //3 seconds confirmati of studetn added

</script>


<body>

    <?php
        if (!empty($message)) 
        {
            echo $message;
        }
    ?>


<h1>View Students</h1>

<div class="view-links">
    <a href="index.php" class="btn">Back to Home</a>
    <a href="add_student.php" class="btn">Add New Student</a>
    <a href="logout.php" class="btn logout-btn">Logout</a>
</div>

<table>
    <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Room Number</th>
            <th>Email</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>

    <?php 
        while ($row = mysqli_fetch_assoc($result)) //loops through rows of database
        { 
    ?>
        <tr>
            <td><?php echo htmlspecialchars($row['id']);?></td>
            <td><?php echo htmlspecialchars($row['name']);?></td>
            <td><?php echo htmlspecialchars($row['room_number']);?></td>
            <td><?php echo htmlspecialchars($row['email']); ?></td>
            <td>
                <a href="edit_student.php?id=<?php echo $row['id']; ?>" class="action-btn">Edit</a> |
                <a href="delete_student.php?id=<?php echo $row['id']; ?>" class="action-btn delete" onclick="return confirm('Are you sure?');">Delete</a>
            </td>
        </tr>
    <?php 
        }
    ?>
    </tbody>
</table>

</div>

</body>
</html>