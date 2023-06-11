<?php
namespace AK\Technologies;

class T27_LatinAlphabet extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T27_LatinAlphabet';
    $this->type = WRITING;
    $this->number = 27;
    $this->lvl = 1;
    $this->name = clienttranslate('Latin Alphabet');
    $this->requirement = [clienttranslate('5 monuments in your Past.')];

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Choose 1 Technology [II], and put it on the bottom of the corresponding deck.')];
  }
}
