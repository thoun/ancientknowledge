<?php
namespace AK\Cards\Pyramids;

class P15_XixiaWangling extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P15_XixiaWangling';
    $this->type = PYRAMID;
    $this->number = 15;
    $this->name = clienttranslate('Xixia Wangling');
    $this->country = clienttranslate('China');
    $this->text = [clienttranslate('The Western Xia Tombs is a mortuary site with an area of 50 square kilometers.')];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 3;
    $this->startingSpace = 2;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Discard 3 <KNOWLEDGE> or less from a monument adjacent to this one.')];
    $this->implemented = true;
  }

  public function getImmediateEffect()
  {
    $cardIds = [];
    $allCardIds = [];
    foreach ($this->getAdjacentBuildings() as $card) {
      $n = $card->getKnowledge();
      if ($n >= 3) {
        $cardIds[] = $card->getId();
      }
      if ($n > 0) {
        $allCardIds[] = $card->getId();
      }
    }

    return empty($cardIds) && empty($allCardIds)
      ? null
      : [
        'action' => REMOVE_KNOWLEDGE,
        'args' => [
          'n' => 3,
          'cardIds' => empty($cardIds) ? $allCardIds : $cardIds,
          'type' => NODE_XOR,
        ],
      ];
  }
}
