<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class MoveBuilding extends \AK\Models\Action
{
  public function getState()
  {
    return ST_MOVE_BUILDING;
  }

  public function isOptional()
  {
    $player = Players::getActive();
    return !$this->isDoable($player);
  }

  public function isDoable($player, $ignoreResources = false)
  {
    return $player->getTimeline()->count() >= 1;
  }

  public function getDescription()
  {
    $cardId = $this->getCardId();

    return is_null($cardId)
      ? clienttranslate('Move one building in your timeline')
      : [
        'log' => clienttranslate('Move ${card_name} in your timeline'),
        'args' => [
          'card_name' => Cards::getSingle($cardId)->getName(),
          'card_id' => $cardId,
        ],
      ];
  }

  public function getCardId()
  {
    return $this->getCtxArg('cardId');
  }

  public function argsMoveBuilding()
  {
    $player = Players::getActive();
    $cardId = $this->getCardId();
    return [
      'cardIds' => $player->getTimeline()->getIds(),
      'slots' => $player->getFreeSlots(),
      'descSuffix' => is_null($cardId) ? '' : 'fixed',
      'card_id' => $cardId,
      'card_name' => is_null($cardId) ? '' : Cards::getSingle($cardId)->getName(),
    ];
  }

  public function actMoveBuilding($cardId1, $slot)
  {
    // Sanity checks
    self::checkAction('actMoveBuilding');
    $player = Players::getActive();
    $args = $this->argsSwap();
    if (!in_array($cardId1, $args['cardIds'])) {
      throw new \BgaVisibleSystemException('Invalid card. Should not happen');
    }
    if (!in_array($slot, $args['slots'])) {
      throw new \BgaVisibleSystemException('Invalid slot. Should not happen');
    }
    if (!is_null($args['card_id']) && $cardId1 != $args['card_id']) {
      throw new \BgaVisibleSystemException('You must move the forced card. Should not happen');
    }

    // Swap them
    $card = Cards::get($cardId1);
    $card->setLocation($slot);
    Notifications::moveBuilding($player, $card, $this->getSourceId());

    $this->resolveAction();
  }
}
