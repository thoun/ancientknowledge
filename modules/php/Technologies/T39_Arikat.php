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
    $this->lvl = 2;
    $this->name = clienttranslate('Ari-kat');
    $this->requirement = [clienttranslate('3 <CITY>, 3 <MONOLITH>, 3 <PYRAMID> in your past.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('5 <VP>')];
  }
}
