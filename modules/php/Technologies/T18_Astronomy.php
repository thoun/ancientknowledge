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
    $this->lvl = 1;
    $this->name = clienttranslate('Astronomy');
    $this->requirement = [clienttranslate('1 <CITY>, 1 <PYRAMID> in your past.')];

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Draw 3 cards.')];
  }
}
