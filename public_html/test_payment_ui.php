<?php
session_start();

// Mock session data for payment_page.php
$_SESSION['temp_application_data'] = [
    'country_name' => 'Thailand',
    'payment_amount' => 25000.00,
    'currency' => 'INR',
    'order_contact_email' => 'test@example.com',
    'order_contact_phone' => '1234567890',
    'total_people' => 2,
    'country_id' => 1
];

// Redirect to payment_page.php with a mock temp_order_id
header('Location: payment_page.php?temp_order_id=MOCK-12345');
exit;
