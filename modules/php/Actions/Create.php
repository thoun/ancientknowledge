<?php

namespace AK\Actions;

use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Core\Globals;
use AK\Core\Engine;
use AK\Helpers\Utils;

class Create extends \AK\Models\Action
{
  public function getState()
  {
    return ST_CREATE;
  }

  public function getDescription()
  {
    $constraint = $this->getCtxArg('constraint');
    if ($constraint == BUILDINGS) {
      return clienttranslate('Create a monument');
    } elseif ($constraint == [ARTEFACT]) {
      return clienttranslate('Create an artifact');
    }

    return clienttranslate('Create');
  }

  public function stCreate()
  {
    $player = Players::getActive();
    $cardId = $this->getCtxArg('autoplayArtefact');
    if (!is_null($cardId)) {
      $this->actCreate($cardId, $player->getFreeArtefactSlot(), $this->getCtxArg('autoplayDiscard'));
    }
  }

  public function getPlayableCards($player, $isDoable = false)
  {
    $freeSlots = $player->getFreeSlots();
    $freeArtefactSlot = $player->getFreeArtefactSlot();
    $constraint = $this->getCtxArg('constraint');
    $hand = $player->getHand();
    $cards = [];
    foreach ($hand as $card) {
      // Do we have any constraint ?
      if (!is_null($constraint) && !in_array($card->getType(), $constraint)) {
        continue;
      }

      // Must be able to discard enough cards
      $discard = $card->getDiscard();
      if ($discard >= $hand->count()) {
        continue;
      }

      $slots = [];
      // Artefact => just take the first slot available, if any
      if ($card->isArtefact()) {
        if (!is_null($freeArtefactSlot)) {
          $slots[$freeArtefactSlot] = $discard;
        }
      }
      // Buildings => check all the slots, unless locked
      else {
        $available = $card->isLockedSpace() ? [$card->getStartingSpace()] : [1, 2, 3, 4, 5, 6];
        foreach ($available as $time) {
          // Enough card ?
          $totalToDiscard = $discard + abs($time - $card->getStartingSpace());
          if ($totalToDiscard >= $hand->count()) {
            continue;
          }
          // Free slot at that time ?
          $freeSlot = $freeSlots[$time] ?? null;
          if (is_null($freeSlot)) {
            continue;
          }

          $slots[$freeSlot] = $totalToDiscard;
        }
      }

      // At least one playable slots => ok
      if (!empty($slots)) {
        if ($isDoable) {
          return true;
        }

        $cards[$card->getId()] = $slots;
      }
    }

    return $isDoable ? false : $cards;
  }

  public function argsCreate()
  {
    $player = Players::getActive();
    return [
      '_private' => [
        'active' => [
          'cards' => $this->getPlayableCards($player),
        ],
      ],
    ];
  }

  public function actCreate($cardId, $slot, $cardIdsToDiscard)
  {
    // Sanity checks
    self::checkAction('actCreate');
    $player = Players::getActive();
    $cards = $this->argsCreate()['_private']['active']['cards'];
    $slots = $cards[$cardId] ?? null;
    $autoCardId = $this->getCtxArg('autoplayArtefact');
    if (is_null($slots)) {
      throw new \BgaVisibleSystemException('Invalid card. Should not happen');
    }
    if (!array_key_exists($slot, $slots)) {
      throw new \BgaVisibleSystemException('Invalid place. Should not happen');
    }
    if (count($cardIdsToDiscard) != $slots[$slot] && is_null($autoCardId)) {
      throw new \BgaVisibleSystemException('Invalid number of cards to discard. Should not happen');
    }
    if (!empty(array_diff($cardIdsToDiscard, $player->getHand()->getIds()))) {
      throw new \BgaVisibleSystemException('Invalid cards to discard. Should not happen');
    }

    // Discard cards
    if (count($cardIdsToDiscard) > 0) {
      $cards = Cards::getMany($cardIdsToDiscard);
      Cards::discard($cardIdsToDiscard);
      Notifications::discardCards($player, $cards);
    }

    // Move card
    $card = Cards::getSingle($cardId);
    $card->setLocation($slot);
    if (!$card->isArtefact()) {
      $knowledge = $card->getInitialKnowledge();
      $knowledge -= $card->getInitialKnowledgeDiscount();
      foreach ($player->getTimeline()->merge($player->getArtefacts()) as $card2) {
        if ($card->getId() != $card2->getId()) {
          $knowledge -= $card2->getKnowledgeReduction($card);
        }
      }
      $knowledge = max(0, $knowledge);
      $card->setKnowledge($knowledge);
    }
    $sourceId = $this->ctx->getSourceId();
    Notifications::createCard($player, $card, $sourceId);

    // Check immediate effect
    if ($card->getActivation() == \IMMEDIATE && method_exists($card, 'getImmediateEffect')) {
      $this->pushParallelChild([
        'action' => \ACTIVATE_CARD,
        'args' => ['cardId' => $card->getId(), 'activation' => IMMEDIATE],
      ]);
    }

    // PotalaPalace => flag global to skip Decline
    if ($card->getId() == 'C30_PotalaPalace' && !Globals::isDeclinePhase()) {
      Globals::setSkipDecline(true);
    }

    // Check listener
    $this->checkAfterListeners($player, ['card' => $card, 'slot' => $slot, 'sourceId' => $this->getSourceId()]);

    // Edge case !
    if (Globals::isDeclinePhase() && !$card->isArtefact() && $card->getTimelineSpace()[0] == 1) {
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

    $this->resolveAction(['cardId' => $cardId, 'slot' => $slot]);
  }
}
