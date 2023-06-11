<?php
namespace AK\Technologies;

class T30_Thoth extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T30_Thoth';
    $this->type = ANCIENT;
    $this->number = 30;
    $this->lvl = 2;
    $this->name = clienttranslate('Thoth');
    $this->requirement = [clienttranslate('9 <LOST_KNOWLEDGE> on your board.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('2 <VP>')];
  }
}
