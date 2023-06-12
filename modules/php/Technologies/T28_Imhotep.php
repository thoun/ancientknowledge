<?php
namespace AK\Technologies;

class T28_Imhotep extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T28_Imhotep';
    $this->type = ANCIENT;
    $this->number = 28;
    $this->lvl = 2;
    $this->name = clienttranslate('Imhotep');
    $this->requirement = [clienttranslate('4 <ARTEFACT> on your board.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('3 <VP>')];
  }
}