<?php
require_once 'db.php';

$thailand_id_query = $pdo->query("SELECT id FROM countries WHERE country_name LIKE '%Thailand%' LIMIT 1");
$thailand_id = $thailand_id_query->fetchColumn();

if ($thailand_id) {
    $stmt = $pdo->prepare("SELECT * FROM country_questions WHERE country_id = ? AND field_key = 'hotel_province'");
    $stmt->execute([$thailand_id]);
    $question = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Question: " . print_r($question, true) . "\n";
    
    if ($question) {
        $stmt = $pdo->prepare("SELECT * FROM question_options WHERE question_id = ? ORDER BY sort_order ASC");
        $stmt->execute([$question['id']]);
        $options = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "Options count: " . count($options) . "\n";
        foreach ($options as $opt) {
            echo "- " . $opt['option_label'] . " (" . $opt['option_value'] . ")\n";
        }
    }
} else {
    echo "Thailand not found.\n";
}
