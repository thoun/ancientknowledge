<?php
namespace AK\Cards\Monoliths;

class M6_DolmenOfGanghwa extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M6_DolmenOfGanghwa';
    $this->type = MONOLITH;
    $this->number = 6;
    $this->name = clienttranslate('Dolmen Of Ganghwa');
    $this->country = clienttranslate('South Korea');
    $this->text = [
      clienttranslate("Korea contains about 40% of the world's dolmens. Most of them are concentrated at the Ganghwa site."),
    ];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 4;
    $this->startingSpace = 4;
    $this->discard = 1;
    $this->activation = ENDGAME;
    $this->effect = [
      clienttranslate("• If you have 3 [écriture] or 4 [écriture], gain 4 <VP>.
• or, if you have 5 [écriture] or more, gain 7 <VP>."),
    ];
  }
}
