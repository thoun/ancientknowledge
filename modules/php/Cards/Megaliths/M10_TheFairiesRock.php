<?php
namespace AK\Cards\Megaliths;

class M10_TheFairiesRock extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M10_TheFairiesRock';
    $this->type = MEGALITH;
    $this->number = 10;
    $this->name = clienttranslate('The Fairies\' Rock');
    $this->country = clienttranslate('France');
    $this->text = [
      clienttranslate(
        'This dolmen is made up of more than forty stones forming a corridor oriented north-northwest – south-southeast.'
      ),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 2;
    $this->startingSpace = 2;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('Each of your opponents must discard 1 card from their hand.')];
  }

  public function getDeclineEffect()
  {
    return [
      'action' => DISCARD_MULTI,
      'args' => ['current' => $this->pId, 'n' => 1],
      'pId' => 'opponents',
    ];
  }
}
