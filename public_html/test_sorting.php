<?php
require_once 'db.php';
session_start();

$_SESSION['country_name'] = 'Thailand';
$current_q = ['field_key' => 'hotel_province', 'label' => 'Hotel Province'];

$select_options = [
    ['option_label' => 'Amnat Charoen', 'option_value' => 'Amnat Charoen'],
    ['option_label' => 'Bangkok', 'option_value' => 'Bangkok'],
    ['option_label' => 'Phuket', 'option_value' => 'Phuket'],
    ['option_label' => 'Chon Buri', 'option_value' => 'Chon Buri'],
    ['option_label' => 'Z-City', 'option_value' => 'Z-City']
];

// Logic from index.php
$field_key = $current_q['field_key'] ?? '';
$country_name = $_SESSION['country_name'] ?? '';
if (($field_key === 'hotel_province' || $field_key === 'province' || stripos($current_q['label'], 'Province') !== false) && stripos($country_name, 'Thailand') !== false) {
    $popular = [
        'BANGKOK', 'PHUKET', 'CHON BURI', 'SURAT THANI', 
        'KRABI', 'CHIANG MAI', 'PHANG NGA', 'SONGKHLA',
        'CHONBURI', 'PATTAYA', 'SAMUI'
    ];
    
    $popular_indices = array_flip($popular);
    
    usort($select_options, function($a, $b) use ($popular_indices) {
        $labelA = strtoupper(trim($a['option_label'] ?? ''));
        $labelB = strtoupper(trim($b['option_label'] ?? ''));
        
        $isPopA = isset($popular_indices[$labelA]);
        $isPopB = isset($popular_indices[$labelB]);
        
        if ($isPopA && $isPopB) {
            return $popular_indices[$labelA] - $popular_indices[$labelB];
        }
        if ($isPopA) return -1;
        if ($isPopB) return 1;
        
        return strcmp($labelA, $labelB);
    });
}

echo "Sorted Options for Thailand Province:\n";
foreach ($select_options as $opt) {
    echo "- " . $opt['option_label'] . "\n";
}
?>
