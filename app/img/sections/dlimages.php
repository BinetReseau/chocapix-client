<?php

// Noms des bars
$bars = array(
	'aviron',
	'badminton',
	'basket',
	'boxe',
	'equitjudo',
	'equitescrime',
	'escalade',
	'escrime',
	'foot',
	'hand',
	'judo',
	'natation',
	'raid',
	'rugby',
	'tennis',
	'volley'
	);
$promos = array(
	'rouje',
	'jone'
	);

foreach ($bars as $bar) {
	foreach ($promos as $promo) {
		echo '===== ' . $bar . ' - ' . $promo . "\n";
		copy('http://bars/images/' . $promo . '-' . $bar . '.png', $bar . $promo . '.png');
	}
}
