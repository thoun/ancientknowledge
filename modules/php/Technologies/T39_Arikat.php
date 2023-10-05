<?php
namespace AK\Technologies;

class T39_Arikat extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T39_Arikat';
    $this->type = SECRET;
    $this->number = 39;
    $this->level = 2;
    $this->name = clienttranslate('Ari-kat');
    $this->requirement = [clienttranslate('3 <CITY>, 3 <MEGALITH>, 3 <PYRAMID> in your past.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('5 <VP>')];
    $this->implemented = true;
  }

  public function canBePlayed($player)
  {
    // How many types are not in the past ?
    $icons = $player->countIcons(BUILDINGS);
    $nNotEnough = 0;
    foreach ($icons as $type => $n) {
      if ($n < 3) {
        $nNotEnough++;
      }
    }

    // Must be 0 or 1 if we have CandiSukuh
    return $nNotEnough <= $player->getIconReduction();
  }

  public function getScore()
  {
    return 5;
  }
}
