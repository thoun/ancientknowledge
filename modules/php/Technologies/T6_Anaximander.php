<?php
namespace AK\Technologies;

class T6_Anaximander extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T6_Anaximander';
    $this->type = ANCIENT;
    $this->number = 6;
    $this->lvl = 1;
    $this->name = clienttranslate('Anaximander');

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Discard 1 <KNOWLEDGE> from each <PYRAMID> in your Timeline.')];
  }
}
