<?php

function clienttranslate($str)
{
  return $str;
}
class APP_DbObject
{
}

include_once '../modules/php/constants.inc.php';
$swdNamespaceAutoload = function ($class) {
  $classParts = explode('\\', $class);
  if ($classParts[0] == 'AK') {
    array_shift($classParts);
    $file = dirname(__FILE__) . '/../modules/php/' . implode(DIRECTORY_SEPARATOR, $classParts) . '.php';
    if (file_exists($file)) {
      require_once $file;
    } else {
      var_dump('Cannot find file : ' . $file);
    }
  }
};
spl_autoload_register($swdNamespaceAutoload, true, true);

function getCardInstance($id, $data = null)
{
  $t = explode('_', $id);
  // First part before _ specify the type and the numbering
  $prefixes = [
    'C' => 'Cities',
    'M' => 'Monoliths',
    'P' => 'Pyramids',
    'A' => 'Artefacts',
  ];
  $prefix = $prefixes[$t[0][0]];

  require_once "../modules/php/Cards/$prefix/$id.php";
  $className = "\AK\Cards\\$prefix\\$id";
  return new $className($data);
}

include_once '../modules/php/Cards/list.inc.php';

$cards = [];
foreach ($cardIds as $cardId) {
  $card = getCardInstance($cardId);
  $cards[$cardId] = $card->getStaticData();
}

function getTechInstance($id, $data = null)
{
  require_once "../modules/php/Technologies/$id.php";
  $className = "\AK\Technologies\\$id";
  return new $className($data);
}

include_once '../modules/php/Cards/list.inc.php';

$cards = [];
foreach ($cardIds as $cardId) {
  $card = getCardInstance($cardId);
  $cards[$cardId] = $card->getStaticData();
}

include_once '../modules/php/Technologies/list.inc.php';

$techs = [];
foreach ($techIds as $techId) {
  $tech = getTechInstance($techId);
  $techs[$techId] = $tech->getStaticData();
}

$fp = fopen('./cardsData.js', 'w');
fwrite($fp, 'const CARDS_DATA = ' . json_encode($cards) . ';');
fwrite($fp, 'const TECHS_DATA = ' . json_encode($techs) . ';');
fclose($fp);
