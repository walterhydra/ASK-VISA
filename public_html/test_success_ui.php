<?php
session_start();
require 'db.php';

// Try to find a real order ID first, or mock one
$stmt = $pdo->query("SELECT id FROM visa_orders LIMIT 1");
$order = $stmt->fetch();
$order_id = $order['id'] ?? 1;

// Redirect to payment_successfull.php
header('Location: payment_successfull.php?order_id=' . $order_id);
exit;
