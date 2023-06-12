<?php
namespace AK\Technologies;

class T33_PlinyTheElder extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T33_PlinyTheElder';
    $this->type = ANCIENT;
    $this->number = 33;
    $this->level = 2;
    $this->name = clienttranslate('Pliny The Elder');
    $this->requirement = [clienttranslate('3 <ANCIENT> in your collection.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('2 <VP>')];
  }
}
