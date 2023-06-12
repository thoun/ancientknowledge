<?php
namespace AK\Cards\Artefacts;

class A12_PachamamaMegalith extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A12_PachamamaMegalith';
    $this->type = ARTEFACT;
    $this->number = 12;
    $this->name = clienttranslate('Pachamama Megalith');
    $this->country = clienttranslate('Bolivia');
    $this->text = [
      clienttranslate(
        'Discovered in Tiwanaku, it represents a red stone giant. At 7.30 meters high, it is the largest monolith on the site'
      ),
    ];
    $this->discard = 3;
    $this->activation = ENDTURN;
    $this->effect = [
      clienttranslate(
        'If you have at least 5 <PYRAMID> in your Past, you may LEARN 1 Technology if you fulfill its requirements.'
      ),
    ];
  }
}
