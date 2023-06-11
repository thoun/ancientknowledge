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
    $this->lvl = 1;
    $this->name = clienttranslate('Anaximenes');
    $this->requirement = [clienttranslate('3 <ARTEFACT> on your board.')];

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Draw 3 cards.')];
  }
}
