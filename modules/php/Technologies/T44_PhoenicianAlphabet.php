<?php
namespace AK\Technologies;

class T44_PhoenicianAlphabet extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T44_PhoenicianAlphabet';
    $this->type = WRITING;
    $this->number = 44;
    $this->level = 2;
    $this->name = clienttranslate('Phoenician Alphabet');
    $this->requirement = [clienttranslate('15 <LOST_KNOWLEDGE> on your board.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('4 <VP>')];
  }
}
