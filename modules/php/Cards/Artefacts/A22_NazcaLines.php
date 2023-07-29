<?php
namespace AK\Cards\Artefacts;

class A22_NazcaLines extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A22_NazcaLines';
    $this->type = ARTEFACT;
    $this->number = 22;
    $this->name = clienttranslate('Nazca Lines');
    $this->country = clienttranslate('Peru');
    $this->text = [
      clienttranslate(
        'These stylized animals or simple lines (that go on for several kilometers) are only visible from the sky.'
      ),
    ];
    $this->activation = ANYTIME;
    $this->effect = [clienttranslate('Each time you CREATE  1 <PYRAMID>, draw 1 card.')];
    $this->implemented = true;
  }

  public function isListeningTo($event)
  {
    return $this->isActionEvent($event, 'Create') && $event['card']->getType() == PYRAMID;
  }

  public function onPlayerAfterCreate($event)
  {
    return [
      'action' => DRAW,
      'args' => ['n' => 1],
    ];
  }
}
