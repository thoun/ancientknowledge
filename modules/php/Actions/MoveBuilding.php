<?php

namespace AK\Actions;

use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Core\Globals;
use AK\Core\Engine;
use AK\Helpers\Utils;

class MoveBuilding extends \AK\Models\Action
{
  public function getState()
  {
    return ST_MOVE_BUILDING;
  }

  public function isAutomatic($player = null)
  {
    return !is_null($this->getCardId()) && !is_null($this->getSlot());
  }

  public function isOptional()
  {
    $player = Players::getActive();
    return !$this->isDoable($player);
  }

  public function isDoable($player, $ignoreResources = false)
  {
    return $player->getTimeline()->count() >= 1 && !empty($this->getCardIds($player));
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

  public function getSlot()
  {
    return $this->getCtxArg('slot');
  }

  public function getCardIds($player)
  {
    $cardId = $this->getCardId();
    if (!is_null($cardId)) {
      return [$cardId];
    }

    $cards = $player->getTimeline()->filter(fn ($card) => $card->getState() != DECLINING);

    // Potential constraint on movable cards
    $constraint = $this->getCtxArg('constraint');
    if ($constraint == 'no_knowledge') {
      $cards = $cards->filter(function ($card) {
        return $card->getKnowledge() == 0;
      });
    }

    // Some cards cant be moved (eg card saying "exchange two OTHER cards")
    $ids = $cards->getIds();
    $excludedId = $this->getCtxArg('excluded');
    if (!is_null($excludedId)) {
      $ids = array_diff($ids, [$excludedId]);
    }

    return $ids;
  }

  public function argsMoveBuilding()
  {
    $player = Players::getActive();
    $cardId = $this->getCardId();
    return [
      'cardIds' => $this->getCardIds($player),
      'slots' => $player->getFreeSlots(),
      'descSuffix' => is_null($cardId) ? '' : 'fixed',
      'card_id' => $cardId,
      'card_name' => is_null($cardId) ? '' : Cards::getSingle($cardId)->getName(),
    ];
  }

  public function stMoveBuilding()
  {
    $cardId = $this->getCardId();
    $slot = $this->getSlot();
    if (!is_null($cardId) && !is_null($slot)) {
      $this->actMoveBuilding($cardId, $slot, true);
    }
  }

  public function actMoveBuilding($cardId, $slot, $auto = false)
  {
    // Sanity checks
    self::checkAction('actMoveBuilding', $auto);
    $player = Players::getActive();
    $args = $this->argsMoveBuilding();
    if (!in_array($cardId, $args['cardIds'])) {
      throw new \BgaVisibleSystemException('Invalid card. Should not happen');
    }
    if (!in_array($slot, $args['slots'])) {
      throw new \BgaVisibleSystemException('Invalid slot. Should not happen');
    }
    if (!is_null($args['card_id']) && $cardId != $args['card_id']) {
      throw new \BgaVisibleSystemException('You must move the forced card. Should not happen');
    }
    $card = Cards::get($cardId);
    $from = $card->getTimelineSpace();
    if ($from[1] == 0 && $slot == "timeline-$from[0]-1") {
      throw new \BgaVisibleSystemException('You cant move a card on top of itself. Should not happen');
    }

    // Swap them
    $card->setLocation($slot);
    Notifications::moveBuilding($player, $card, $this->getSourceId());

    // Any behind above that need to slide down ??
    Cards::slideDownIfNeeded($from, $player);

    // Edge case !
    if (Globals::isDeclinePhase() && $card->getTimelineSpace()[0] == 1) {
      $node = $this->ctx;
      while (!is_null($node) && $node->getAction() != 'DECLINE_CARD') {
        $node = $node->getParent();
      }
      if (!is_null($node)) {
        $node->insertAsBrother(
          Engine::buildTree([
            'action' => DECLINE_CARD,
            'args' => ['cardId' => $card->getId()],
          ])
        );
      }
    }

    $this->resolveAction();
  }
}
