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

    // TODO listeners

    // Effect
    if ($card->getActivation() == DECLINE) {
      $this->insertAsChild([
        'action' => \ACTIVATE_CARD,
        'args' => ['cardId' => $card->getId(), 'activation' => DECLINE],
      ]);
    }

    // Move to past
    $this->insertAsChild([
      'action' => \DECLINE_CARD,
      'args' => ['method' => 'stMoveToPast', 'cardId' => $cardId],
    ]);
    $this->resolveAction();
  }

  public function stMoveToPast()
  {
    $player = Players::getActive();
    $cardId = $this->getCtxArg('cardId');
    $card = Cards::getSingle($cardId);

    $card->setLocation('past');
    $knowledge = $card->getKnowledge();
    $card->setKnowledge(0);
    $player->incLostKnowledge($knowledge);
    Notifications::declineCard($player, $card, $knowledge);

    $this->resolveAction();
  }
}
