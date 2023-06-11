<?php
namespace AK\Technologies;

class T9_Mercury extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T9_Mercury';
    $this->type = ANCIENT;
    $this->number = 9;
    $this->lvl = 1;
    $this->name = clienttranslate('Mercury');

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Discard 2 <LOST_KNOWLEDGE> from your board.')];
  }
}
