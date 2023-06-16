<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class DeclineCard extends \AK\Models\Action
{
  public function getState()
  {
    return ST_DECLINE_CARD;
  }

  public function isAutomatic($player = null)
  {
    return true;
  }

  public function stDeclineCard()
  {
    $player = Players::getActive();
    $cardId = $this->getCtxArg('cardId');
    $card = Cards::getSingle($cardId);
    die('TODO: DeclineCard');

    $this->resolveAction();
  }
}
