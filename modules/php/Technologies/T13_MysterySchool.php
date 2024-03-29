<?php
namespace AK\Technologies;

class T13_MysterySchool extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T13_MysterySchool';
    $this->type = SECRET;
    $this->number = 13;
    $this->level = 1;
    $this->name = clienttranslate('Mystery School');

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Draw 1 card for each <CITY> in your Timeline.')];
  }

  public function getImmediateEffect()
  {
    $n = $this->getPlayer()->countIconInTimeline(CITY);
    return $n == 0
      ? null
      : [
        'action' => DRAW,
        'args' => ['n' => $n],
      ];
  }
}
