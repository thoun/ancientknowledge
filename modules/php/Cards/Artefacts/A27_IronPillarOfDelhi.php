<?php
namespace AK\Cards\Artefacts;

class A27_IronPillarOfDelhi extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A27_IronPillarOfDelhi';
    $this->type = ARTEFACT;
    $this->number = 27;
    $this->name = clienttranslate('Iron Pillar Of Delhi');
    $this->country = clienttranslate('India');
    $this->text = [
      clienttranslate(
        'It is known for having a strong resistance to rust, due to a uniform layer of crystalline iron hydrogen phosphate which protects it from environmental effects.'
      ),
    ];
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate("If you have 2 monuments in space [n°1]:
• Discard 1 <KNOWLEDGE> from any of your monument;
• and draw 1 card."),
    ];
  }

  public function getTimelineEffect()
  {
    $slots = $this->getPlayer()->getFreeSlots();
    $slot0 = 'timeline-1-0';
    $slot1 = 'timeline-1-1';
    return in_array($slot0, $slots) || in_array($slot1, $slots)
      ? null
      : [
        'type' => NODE_SEQ,
        'childs' => [
          [
            'action' => \DISCARD_LOST_KNOWLEDGE,
            'args' => ['n' => 1],
          ],
          [
            'action' => DRAW,
            'args' => ['n' => 1],
          ],
        ],
      ];
  }
}
