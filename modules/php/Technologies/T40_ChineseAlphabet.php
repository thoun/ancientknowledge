<?php
namespace AK\Technologies;

class T40_ChineseAlphabet extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T40_ChineseAlphabet';
    $this->type = WRITING;
    $this->number = 40;
    $this->lvl = 2;
    $this->name = clienttranslate('Chinese Alphabet');
    $this->requirement = [clienttranslate('3 <MEGALITH> in your past.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('2 <VP>')];
  }
}
