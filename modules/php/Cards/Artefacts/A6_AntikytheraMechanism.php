<?php
namespace AK\Cards\Artefacts;

class A6_AntikytheraMechanism extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A6_AntikytheraMechanism';
    $this->type = ARTEFACT;
    $this->number = 6;
    $this->name = clienttranslate('Antikythera Mechanism');
    $this->country = clienttranslate('Greece');
    $this->text = [clienttranslate('This mechanism is considered the first astronomical position calculator.')];
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate(
        'If one of your monuments in the [n°1] space of your Timeline has at least 4 <KNOWLEDGE>, move it to [n°3] if possible. Otherwise nothing happens.'
      ),
    ];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    $player = $this->getPlayer();
    $slots = ['timeline-1-0', 'timeline-1-1'];
    $childs = [];
    foreach ($slots as $slot) {
      $card = $player->getCardOnTimelineSpace($slot);
      if (!is_null($card) && $card->getKnowledge() >= 4) {
        $childs[] = [
          'action' => \MOVE_BUILDING,
          'args' => ['cardId' => $card->getId()],
        ];
      }
    }

    return empty($childs)
      ? null
      : [
        'type' => NODE_XOR,
        'childs' => $childs,
      ];
  }
}
