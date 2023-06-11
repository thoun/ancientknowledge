<?php
namespace AK\Technologies;

class T7_Melchizedek extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T7_Melchizedek';
    $this->type = ANCIENT;
    $this->number = 7;
    $this->lvl = 1;
    $this->name = clienttranslate('Melchizedek');
    $this->requirement = [clienttranslate('1 <CITY>, 1 <MONOLITH>, 1 <PYRAMID> in your past.')];

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Draw 4 cards.')];
  }
}
