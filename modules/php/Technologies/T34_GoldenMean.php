<?php
namespace AK\Technologies;

class T34_GoldenMean extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T34_GoldenMean';
    $this->type = SECRET;
    $this->number = 34;
    $this->lvl = 2;
    $this->name = clienttranslate('Golden Mean');
    $this->requirement = [clienttranslate('3 <CITY> in your past.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('2 <VP>')];
  }
}