<?php
namespace AK\Technologies;

class T20_RongorongoGlyphs extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T20_RongorongoGlyphs';
    $this->type = WRITING;
    $this->number = 20;
    $this->lvl = 1;
    $this->name = clienttranslate('Rongorongo Glyphs');

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Discard 1 <KNOWLEDGE> from each <MONOLITH> in your Timeline.')];
  }
}
