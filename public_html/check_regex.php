<?php
require 'db.php';
$stmt = $pdo->query("SELECT id, validation_rules FROM country_questions WHERE validation_rules LIKE '%regex%' LIMIT 10");
echo "Regex Check:\n";
while ($row = $stmt->fetch()) {
    echo "ID: " . $row['id'] . " | Rules: " . $row['validation_rules'] . "\n";
}
?>
