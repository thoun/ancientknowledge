<?php
namespace AK\Cards\Artefacts;

class A7_MoaiStatue extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A7_MoaiStatue';
    $this->type = ARTEFACT;
    $this->number = 7;
    $this->name = clienttranslate('Moai Statue');
    $this->country = clienttranslate('Chile');
    $this->text = [
      clienttranslate('Discovered in Colombia, this statue is strangely reminiscent of the Moai statues of Easter Island.'),
    ];
    $this->activation = TIMELINE;
    $this->effect = [clienttranslate('You may discard 2 <ARTIFACT> from your hand. If you do, draw 4 cards.')];
  }

  public function getTimelineEffect()
  {
    return [
      'type' => \NODE_SEQ,
      'optional' => true,
      'childs' => [
        [
          'action' => DISCARD,
          'args' => ['n' => 2, 'precondition' => true, 'constraint' => [ARTEFACT]],
        ],
        [
          'action' => DRAW,
          'args' => ['n' => 4],
        ],
      ],
    ];
  }
}
