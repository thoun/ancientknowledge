<?php
namespace AK\Technologies;

class T18_Astronomy extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T18_Astronomy';
    $this->type = SECRET;
    $this->number = 18;
    $this->level = 1;
    $this->name = clienttranslate('Astronomy');
    $this->requirement = [clienttranslate('1 <CITY>, 1 <PYRAMID> in your past.')];

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Draw 3 cards.')];
  }

  public function canBePlayed($player)
  {
    // How many types are not in the past ?
    $icons = $player->countIcons([PYRAMID, CITY]);
    $nZeroes = 0;
    foreach ($icons as $type => $n) {
      if ($n == 0) {
        $nZeroes++;
      }
    }

    // Must be 0 or 1 if we have CandiSukuh
    return $nZeroes <= $player->getIconReduction();
  }

  public function getImmediateEffect()
  {
    return [
      'action' => DRAW,
      'args' => ['n' => 3],
    ];
  }
}
