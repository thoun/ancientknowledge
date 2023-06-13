<?php
namespace AK\Actions;
use AK\Managers\Meeples;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class Create extends \AK\Models\Action
{
  public function getState()
  {
    return ST_CREATE;
  }

  public function getDescription()
  {
    return clienttranslate('Create');
  }

  public function getPlayableCards($player, $isDoable = false)
  {
    $freeSlots = $player->getFreeSlots();
    $freeArtefactSlot = $player->getFreeArtefactSlot();
    $hand = $player->getHand();
    $cards = [];
    foreach ($hand as $card) {
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
        $available = $card->isLocked() ? [$card->getStartingSpace()] : [1, 2, 3, 4, 5, 6];
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

  public function actCreate($cardId, $slot, $discardedCardIds)
  {
    self::checkAction('actCreate');
    die('test');
  }
}
