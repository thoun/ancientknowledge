<?php
namespace AK\Cards\Artefacts;

class A34_OronceFinEsMap extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A34_OronceFinEsMap';
    $this->type = ARTEFACT;
    $this->number = 34;
    $this->name = clienttranslate('Oronce FinÉ\'s Map');
    $this->country = clienttranslate('France');
    $this->text = [
      clienttranslate(
        'They are distinctive elements of the sculptural tradition of the southern Maya cultural area. The precise use of these carvings is unknown.'
      ),
    ];
    $this->activation = ANYTIME;
    $this->effect = [
      clienttranslate(
        'When you EXCAVATE, if you rotate exactly 3 cards, each of your opponents must discard up to 2 cards from their hands.'
      ),
    ];
    $this->implemented = true;
  }

  public function isListeningTo($event)
  {
    return $this->isActionEvent($event, 'Excavate') && $event['n'] == 3;
  }

  public function onPlayerAfterExcavate($event)
  {
    return [
      'action' => DISCARD_MULTI,
      'args' => ['current' => $this->pId, 'n' => 2],
      'pId' => 'opponents',
    ];
  }
}
