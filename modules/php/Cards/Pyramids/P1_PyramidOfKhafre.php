<?php
namespace AK\Cards\Pyramids;

class P1_PyramidOfKhafre extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P1_PyramidOfKhafre';
    $this->type = PYRAMID;
    $this->number = 1;
    $this->name = clienttranslate('Pyramid Of Khafre');
    $this->country = clienttranslate('Egypt');
    $this->text = [clienttranslate('Second largest pyramid in Egypt, it would have been built for the son of Khufu.')];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 3;
    $this->startingSpace = 2;
    $this->discard = 2;
    $this->activation = ENDGAME;
    $this->effect = [
      clienttranslate("• If you have between 8 and 11 Technologies, gain 5 <VP>.
• or, if you have 12 or more Technologies, gain 12 <VP>."),
    ];
  }
}
