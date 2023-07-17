<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class Straighten extends \AK\Models\Action
{
  public function getState()
  {
    return ST_STRAIGHTEN;
  }

  public function getDescription()
  {
    return [
      'log' => clienttranslate('Straighten up to ${n} cards'),
      'args' => [
        'n' => $this->getN(),
      ],
    ];
  }

  public function getN()
  {
    return $this->getCtxArg('n');
  }

  public function stStraighten()
  {
    $player = Players::getActive();
    $cards = [];
    $n = $this->getN();
    $i = 0;
    foreach ($player->getPast() as $card) {
      if ($card->isRotated()) {
        $cards[] = $card;
        $card->straighten();
        $i++;
        if ($i == $n) {
          break;
        }
      }
    }

    if (!empty($cards)) {
      Notifications::straighten($player, $cards);
    }

    $this->resolveAction();
  }
}
