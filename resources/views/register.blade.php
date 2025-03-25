<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Laravel</title>
    </head>
    <body class="bg-[#FDFDFC] dark:bg-[#0a0a0a] text-[#1b1b18] flex p-6 lg:p-8 items-center lg:justify-center min-h-screen flex-col">
        <h2>Registration form</h2>
        <form action="/register" method="post">
            <input type="text" name="name" placeholder="Enter name" />
            <input type="email" name="email" placeholder="Enter email" />
            <input type="password" name="password" placeholder="Enter password" />
            <input type="password" name="confirmPassword" placeholder="Enter your password again" />
            <input type="text" name="role" placeholder="Enter role" />
            <button type="submit" >Register </button>
        </form> 
    </body>
</html>
