<?php
namespace AK\Technologies;

class T17_EarthquakeEngineering extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T17_EarthquakeEngineering';
    $this->type = SECRET;
    $this->number = 17;
    $this->level = 1;
    $this->name = clienttranslate('Earthquake Engineering');

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Discard up to 3 cards, then draw 1 card for each discarded card.')];
    $this->implemented = true;
  }

  public function getImmediateEffect()
  {
    return [
      'action' => SPECIAL_EFFECT,
      'args' => [
        'sourceId' => $this->id,
        'method' => 'discardAndDraw',
      ],
    ];
  }

  public function getDiscardAndDrawDescription()
  {
    return clienttranslate('Discard and draw up to 3 cards');
  }

  public function argsDiscardAndDraw()
  {
    $cards = $player->getHand();

    return [
      'sourceId' => $this->id,
      'description' => clienttranslate(
        '${actplayer} may discard up to 3 cards to draw 1 card for each discarded card (Earthquake Engineering)'
      ),
      'descriptionmyturn' => clienttranslate(
        'You may discard up to 3 cards to draw 1 card for each discarded card (Earthquake Engineering)'
      ),
      '_private' => [
        'active' => [
          'cardIds' => $cards->getIds(),
        ],
      ],
    ];
  }

  public function actDiscardAndDraw($cardIds)
  {
    die('actDiscardAndDraw');
  }
}
