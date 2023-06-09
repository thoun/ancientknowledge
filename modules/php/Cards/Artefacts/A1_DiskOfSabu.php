<?php
namespace AK\Cards\Artefacts;

class A1_DiskOfSabu extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A1_DiskOfSabu';
    $this->type = ARTEFACT;
    $this->number = 1;
    $this->name = clienttranslate('Disk Of Sabu');
    $this->country = clienttranslate('Egypt');
    $this->text = [clienttranslate('Discovered in the tomb of Sabu, its function and meaning remain unknown.')];
    $this->activation = ENDTURN;
    $this->effect = [
      clienttranslate('If you have at least 4 <MONOLITH> in your Past, discard 1 <LOST_KNOWLEDGE> from your board.'),
    ];
  }
}
