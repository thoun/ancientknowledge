<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class Discard extends \AK\Models\Action
{
  public function getState()
  {
    return ST_DISCARD;
  }

  public function getDescription()
  {
    return [
      'log' => clienttranslate('Discard ${n} card(s)'),
      'n' => $this->getN(),
    ];
  }

  public function getN()
  {
    return $this->getCtxArg('n') ?? 1;
  }

  public function argsDiscard()
  {
    $player = Players::getActive();
    return [
      'n' => $this->getN(),
    ];

    //   '_private' => [
    //     'active' => [
    //       'cards' => $this->getPlayableCards($player),
    //     ],
    //   ],
    // ];
  }

  public function actDiscard($cardIds)
  {
    // Sanity checks
    self::checkAction('actDiscard');
    $player = Players::getActive();
    if (count($cardIds) != $this->getN()) {
      throw new \BgaVisibleSystemException('Invalid number of cards to discard. Should not happen');
    }
    if (!empty(array_diff($cardIds, $player->getHand()->getIds()))) {
      throw new \BgaVisibleSystemException('Invalid cards to discard. Should not happen');
    }

    // Discard cards
    $cards = Cards::get($cardIds);
    Cards::discard($cardIds);
    Notifications::discardCards($player, $cards);

    $this->resolveAction(['n' => count($cardIds)]);
  }
}
