<?php

namespace AK\Cards\Cities;

class C18_AngkorWat extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C18_AngkorWat';
    $this->type = CITY;
    $this->number = 18;
    $this->name = clienttranslate('Angkor Wat');
    $this->country = clienttranslate('Cambodia');
    $this->text = [clienttranslate('Angkor is the largest temple and largest religious monument in the world.')];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 2;
    $this->startingSpace = 6;
    $this->activation = ANYTIME;
    $this->effect = [
      clienttranslate('If you have at least 1 <CITY> in your Past, your other <CITY> enter play with 1 <KNOWLEDGE> less.'),
    ];
  }

  public function getKnowledgeReduction($card)
  {
    return $card->getType() == CITY && $this->getPlayer()->countIcon(CITY) > 0
      ? 1
      : 0;
  }
}
