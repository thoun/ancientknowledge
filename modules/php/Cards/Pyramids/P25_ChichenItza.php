<?php
namespace AK\Cards\Pyramids;

class P25_ChichenItza extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P25_ChichenItza';
    $this->type = PYRAMID;
    $this->number = 25;
    $this->name = clienttranslate('ChichÉn ItzÁ');
    $this->country = clienttranslate('Mexico');
    $this->text = [
      clienttranslate(
        'The rays of the morning and afternoon sun form a snake of shadow and light that ascends the staircase of the pyramid of El Castillo.'
      ),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 2;
    $this->startingSpace = 3;
    $this->activation = ENDTURN;
    $this->effect = [clienttranslate('Discard 1 <KNOWLEDGE> from each <MEGALITH> adjacent to this card.')];
  }
}
