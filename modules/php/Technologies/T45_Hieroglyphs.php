<?php
namespace AK\Technologies;

class T45_Hieroglyphs extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T45_Hieroglyphs';
    $this->type = WRITING;
    $this->number = 45;
    $this->lvl = 2;
    $this->name = clienttranslate('Hieroglyphs');
    $this->requirement = [clienttranslate('5 <MEGALITH> in your past.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('4 <VP>')];
  }
}
