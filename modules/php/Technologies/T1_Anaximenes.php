<?php
namespace AK\Technologies;

class T1_Anaximenes extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T1_Anaximenes';
    $this->type = ANCIENT;
    $this->number = 1;
    $this->level = 1;
    $this->name = clienttranslate('Anaximenes');
    $this->requirement = [clienttranslate('3 <ARTIFACT> on your board.')];

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Draw 3 cards.')];
  }

  public function canBePlayed($player)
  {
    return $player->countIcon(\ARTEFACT) >= 3 - $player->getIconReduction();
  }

  public function getImmediateEffect()
  {
    return [
      'action' => DRAW,
      'args' => ['n' => 3],
    ];
  }
}
