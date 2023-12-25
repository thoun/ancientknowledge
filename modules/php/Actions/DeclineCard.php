<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Managers\Technologies;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Core\Globals;
use AK\Helpers\Utils;

class DeclineCard extends \AK\Models\Action
{
  public function getState()
  {
    return ST_DECLINE_CARD;
  }

  public function getDescription()
  {
    $card = $this->getCard();
    return [
      'log' => clienttranslate('Decline ${card_name}'),
      'args' => [
        'card_name' => $card->getName(),
      ],
    ];
  }

  public function isAutomatic($player = null)
  {
    return true;
  }

  public function isIrreversible($player = null)
  {
    $player = $player ?? Players::getActive();
    return Globals::isFirstHalf() && $this->getCtxArg('method') == 'stMoveToPast' && $player->getPast()->count() == 6;
  }

  public function getCard()
  {
    $cardId = $this->getCtxArg('cardId');
    return Cards::getSingle($cardId);
  }

  public function stDeclineCard()
  {
    $player = Players::getActive();
    $card = $this->getCard();

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
      'args' => ['method' => 'stMoveToPast', 'cardId' => $card->getId()],
    ]);
    $this->resolveAction();
  }

  public function stMoveToPast()
  {
    $player = Players::getActive();
    $cardId = $this->getCtxArg('cardId');
    $card = Cards::getSingle($cardId);
    $from = $card->getTimelineSpace();
    // Some card destroy themselves if knowledge still on them
    if ($card->getLocation() != 'discard') {
      $card->setLocation('past');
      $knowledge = $card->getKnowledge();
      $card->setKnowledge(0);
      $player->incLostKnowledge($knowledge);
      Globals::incDeclinedKnowledge($knowledge);
      Notifications::declineCard($player, $card, $knowledge);

      // Any behind above that need to slide down ??
      Cards::slideDownIfNeeded($from, $player);
    }

    // Check if mid game is reached
    if (Globals::isFirstHalf() && $player->getPast()->count() == 7) {
      Globals::setFirstHalf(false);
      $this->insertAsChild([
        'action' => FLIP_TECH_TILE,
      ]);
    }

    // Check if end of game is reached
    if (!Globals::isEndOfGameTriggered() && $player->getPast()->count() >= 14) {
      Globals::setEndOfGameTriggered(true);
      Notifications::endOfGameTriggered($player);
    }

    $this->resolveAction([]);
  }
}
