<?php
namespace AK\Technologies;

class T23_ArabicNumerals extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T23_ArabicNumerals';
    $this->type = WRITING;
    $this->number = 23;
    $this->lvl = 1;
    $this->name = clienttranslate('Arabic Numerals');
    $this->requirement = [clienttranslate('5 <LOST_KNOWLEDGE> on your board.')];

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Discard 3 <LOST_KNOWLEDGE> from your board.')];
  }
}
