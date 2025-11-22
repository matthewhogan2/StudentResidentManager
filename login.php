<?php
/*

    USERNAME: admin
    PASSWORD: admin

    this file checks if user exist in the database and redirects them to homepage 
    index.php if username and password match

*/

session_start();
include 'database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') 
{
    $username=$_POST['username'];
    $password=$_POST['password'];

    $sql="SELECT * FROM users WHERE username='$username'";
    $result=mysqli_query($conn, $sql);

    if (mysqli_num_rows($result) == 1) 
    {
        $user= mysqli_fetch_assoc($result);

        if ($password==$user['password']) 
        {

            $_SESSION['username']=$username;
            header("Location: index.php");
            exit();
        } 
        else 
        {
            $error="Incorect password. Please try again.";
        }
    } 
    else 
    {
        $error="Username not found.";
    }
}

?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
    <link rel="stylesheet" href="assets/style.css">
</head>

<body>
<div class="form-container">

    <h1>Login</h1>

    <?php
        if (!empty($error)) 
        {
            echo "<div class='error-message'>{$error}</div>";
        }
    ?>

    <form method="POST" action="login.php" class="form-box">
        <input type="text" name="username" placeholder="Username" required><br><br>
        <input type="password" name="password" placeholder="Password" required><br><br>

        <button type="submit" class="btn">Login</button>
    </form>
</div>

</body>
</html>
