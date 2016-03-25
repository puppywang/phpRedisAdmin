<?php

// Check Validate key.
if (!isset($config['signon']['SignonURL'])) {
    die('You must set SignonURL!');
}

session_start();
// Check if we have got signon.
if (!isset($_SESSION['ADMIN_ID']) || !isset($_SESSION['roleid']) || !$_SESSION['ADMIN_ID']) {
    header("Location: " . $config['signon']['SignonURL'], true, 302);
    die;
}

// Check if we have the authorize to access this page.
if ($_SESSION['roleid'] != 1) {
    die("You don't have the access right to acess Admin Page, try contact administrator.");
}