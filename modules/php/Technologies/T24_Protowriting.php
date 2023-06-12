<?php
namespace AK\Technologies;

class T24_Protowriting extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T24_Protowriting';
    $this->type = WRITING;
    $this->number = 24;
    $this->level = 1;
    $this->name = clienttranslate('Proto-writing');
    $this->requirement = [clienttranslate('4 monuments in your Past.')];

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Draw 3 cards.')];
  }
}
