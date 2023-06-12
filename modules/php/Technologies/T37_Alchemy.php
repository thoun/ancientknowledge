<?php
namespace AK\Technologies;

class T37_Alchemy extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T37_Alchemy';
    $this->type = SECRET;
    $this->number = 37;
    $this->level = 2;
    $this->name = clienttranslate('Alchemy');
    $this->requirement = [
      clienttranslate('• 7 monuments in your past.
• 3 <LOST_KNOWLEDGE> or less on your board.'),
    ];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('4 <VP>')];
  }
}
