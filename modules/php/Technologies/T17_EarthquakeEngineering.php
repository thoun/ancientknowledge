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
    $cards = $this->getPlayer()->getHand();

    return [
      'sourceId' => $this->id,
      'descSuffix' => 'EarthquakeEngineering',
      'description' => clienttranslate('${actplayer} may discard up to 3 cards to draw 1 card for each discarded card'),
      'descriptionmyturn' => clienttranslate('You may discard up to 3 cards to draw 1 card for each discarded card'),
      '_private' => [
        'active' => [
          'n' => 3,
          'cardIds' => $cards->getIds(),
        ],
      ],
    ];
  }

  public function actDiscardAndDraw($cardIds)
  {
    // Sanity checks
    self::checkAction('actDiscardAndDraw');
    $player = Players::getActive();
    $args = $this->argsDiscardAndDraw();
    $n = count($cardIds);
    if ($n > 3) {
      throw new \BgaVisibleSystemException('Invalid number of cards to discard. Should not happen');
    }
    if (!empty(array_diff($cardIds, $args['_private']['active']['cardIds']))) {
      throw new \BgaVisibleSystemException('Invalid cards to discard. Should not happen');
    }

    if ($n > 0) {
      // Discard cards
      $cards = Cards::getMany($cardIds);
      Cards::discard($cardIds);
      Notifications::discardCards($player, $cards);

      $this->insertAsChild([
        'action' => DRAW,
        'args' => ['n' => $n],
      ]);
    }

    $this->resolveAction(['n' => $n]);
  }
}
