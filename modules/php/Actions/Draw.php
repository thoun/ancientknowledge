<?php
namespace AK\Actions;
use AK\Managers\Meeples;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class Draw extends \AK\Models\Action
{
  public function getState()
  {
    return ST_DRAW;
  }

  public function getDescription()
  {
    $n = $this->getN();
    return [
      'log' => clienttranslate('Draw ${n} card(s)'),
      'args' => [
        'n' => $n,
      ],
    ];
  }

  public function isAutomatic($player = null)
  {
    return true;
  }

  public function isIrreversible($player = null)
  {
    return true;
  }

  public function getN()
  {
    return $this->getCtxArg('n') ?? 1;
  }

  public function stDraw()
  {
    $player = Players::getActive();
    $n = $this->getN();

    // Draw cards and notify
    $cards = Cards::draw($player, $n);
    // Stats::incCardsDrawn($player, $nInDeck);
    Notifications::drawCards($player, $cards);

    $this->resolveAction();
  }
}
