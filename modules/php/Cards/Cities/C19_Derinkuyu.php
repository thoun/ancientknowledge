<?php
namespace AK\Cards\Cities;

class C19_Derinkuyu extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C19_Derinkuyu';
    $this->type = CITY;
    $this->number = 19;
    $this->name = clienttranslate('Derinkuyu');
    $this->country = clienttranslate('Türkiye');
    $this->text = [clienttranslate('This 13-story underground city could accommodate up to 20,000 people.')];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 3;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('Discard 4 <KNOWLEDGE> from any of your <CITY> with at least 6 <KNOWLEDGE>.')];
    $this->implemented = true;
  }

  public function getDeclineEffect()
  {
    $cardIds = [];
    foreach ($this->getPlayer()->getTimeline() as $card) {
      if ($card->getType() == CITY && $card->getKnowledge() >= 6) {
        $cardIds[] = $card->getId();
      }
    }

    return empty($cardIds)
      ? null
      : [
        'action' => REMOVE_KNOWLEDGE,
        'args' => [
          'n' => 4,
          'cardIds' => $cardIds,
          'type' => NODE_XOR,
        ],
      ];
  }
}
