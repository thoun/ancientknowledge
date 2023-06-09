<?php
namespace AK\Cards\Artefacts;

class A5_IcaStones extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A5_IcaStones';
    $this->type = ARTEFACT;
    $this->number = 5;
    $this->name = clienttranslate('Ica Stones');
    $this->country = clienttranslate('Peru');
    $this->text = [clienttranslate('Discovered in 1964, they constitute a collection of over 15,000 engraved andesite pebbles.')];
    $this->activation = ENDTURN;
    $this->startingHand = 2;
    $this->effect = [clienttranslate('If you have at least 3 [artefact] on your board, draw 1 card.')];
  }
}
