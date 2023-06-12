<?php
namespace AK\Technologies;

class T38_Hermeticism extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T38_Hermeticism';
    $this->type = SECRET;
    $this->number = 38;
    $this->lvl = 2;
    $this->name = clienttranslate('Hermeticism');
    $this->requirement = [clienttranslate('5 <CITY> in your past.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('3 <VP>')];
  }
}