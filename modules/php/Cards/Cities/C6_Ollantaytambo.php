<?php
namespace AK\Cards\Cities;

class C6_Ollantaytambo extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C6_Ollantaytambo';
    $this->type = CITY;
    $this->number = 6;
    $this->name = clienttranslate('Ollantaytambo');
    $this->country = clienttranslate('Peru');
    $this->text = [
      clienttranslate(
        'At this former Inca fortress, there is the famous wall of 6 monoliths made of red porphyry, each more than 3 m high.'
      ),
    ];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 2;
    $this->startingSpace = 2;
    $this->activation = TIMELINE;
    $this->effect = [clienttranslate('Discard 1 <KNOWLEDGE> from each <CITY> adjacent to this card.')];
  }
}
