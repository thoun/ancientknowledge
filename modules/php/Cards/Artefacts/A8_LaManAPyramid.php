<?php
namespace AK\Cards\Artefacts;

class A8_LaManAPyramid extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A8_LaManAPyramid';
    $this->type = ARTEFACT;
    $this->number = 8;
    $this->name = clienttranslate('La ManÁ Pyramid');
    $this->country = clienttranslate('Ecuador');
    $this->text = [clienttranslate('Strangely resembling the pyramid on the US dollar, its outlines shimmer under black light.')];
    $this->activation = ENDTURN;
    $this->startingHand = 1;
    $this->effect = [clienttranslate('You may discard 1 card from your hand. If you do, draw 1 card.')];
  }
}
