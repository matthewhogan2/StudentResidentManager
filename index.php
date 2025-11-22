<?php
session_start();
if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit();
}
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Welcome - Residence Management</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>

    <div class="home-container">

        <h1>Welcome, <?php echo htmlspecialchars($_SESSION['username']); ?>!</h1>

        <div class="home-links">
            <a href="view_students.php" class="home-btn">View Students</a>
            <a href="add_student.php" class="home-btn">Add New Student</a>
            <a href="logout.php" class="home-btn logout-btn">Logout</a>
        </div>

    </div>

</body>
</html>
