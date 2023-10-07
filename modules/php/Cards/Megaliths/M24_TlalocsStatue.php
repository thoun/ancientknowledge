<?php
namespace AK\Cards\Megaliths;

class M24_TlalocsStatue extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M24_TlalocsStatue';
    $this->type = MEGALITH;
    $this->number = 24;
    $this->name = clienttranslate('Tlaloc\'s Statue');
    $this->country = clienttranslate('Mexico');
    $this->text = [
      clienttranslate('Representing the god of water, this monolith measures about 7 meters and weighs around 165 tons.'),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 4;
    $this->startingSpace = 3;
    $this->activation = IMMEDIATE;
    $this->effect = [
      clienttranslate('Add 3 <KNOWLEDGE> from the reserve to any monument in each of your opponents\' Timelines.'),
    ];
  }

  public function getImmediateEffect()
  {
    return [
      'action' => ADD_KNOWLEDGE,
      'args' => ['n' => 3],
    ];
  }
}
