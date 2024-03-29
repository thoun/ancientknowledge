<?php
namespace AK\Cards\Megaliths;

class M2_MenhirDiMonteCorruTundu extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M2_MenhirDiMonteCorruTundu';
    $this->type = MEGALITH;
    $this->number = 2;
    $this->name = clienttranslate('Menhir Di Monte Corru Tundu');
    $this->country = clienttranslate('Italy');
    $this->text = [
      clienttranslate('Located in Locmariaquer, this menhir was 18.5 m high when erected. Its mass is estimated at 280 tons.'),
    ];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 1;
    $this->startingSpace = 4;
    $this->discard = 1;
    $this->startingHand = 4;
    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('If you have at least 15 <LOST_KNOWLEDGE> on your board, gain 9 <VP>.')];
  }

  public function getScore()
  {
    return $this->getPlayer()->getLostKnowledge() >= 15 ? 9 : 0;
  }
}
