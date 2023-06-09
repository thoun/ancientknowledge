<?php
namespace AK\Cards\Artefacts;

class A10_IncahuasiQuipus extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A10_IncahuasiQuipus';
    $this->type = ARTEFACT;
    $this->number = 10;
    $this->name = clienttranslate('Incahuasi Quipus');
    $this->country = clienttranslate('Peru');
    $this->text = [clienttranslate('Never translated, the quipus served the Incas as a communication and counting system.')];
    $this->activation = ENDTURN;
    $this->effect = [
      clienttranslate('If you have 3 <LOST_KNOWLEDGE> or less on your board and at least 1 monument in your Past, draw 1 card.'),
    ];
  }
}
