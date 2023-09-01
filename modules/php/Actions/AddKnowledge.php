<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class AddKnowledge extends \AK\Models\Action
{
  public function getState()
  {
    return ST_ADD_KNOWLEDGE;
  }

  public function getDescription()
  {
    return [
      'log' => clienttranslate('Add ${n} <KNOWLEDGE> to one monument in each opponent\'s timeline'),
      'args' => [
        'n' => $this->getN(),
      ],
    ];
  }

  public function getN()
  {
    return $this->getCtxArg('n') ?? 1;
  }

  public function isOptional()
  {
    $player = Players::getActive();
    return !$this->isDoable($player);
  }

  public function isDoable($player)
  {
    $cardIds = $this->getCardIds($player);
    foreach ($cardIds as $cIds) {
      if (!empty($cIds)) {
        return true;
      }
    }

    return false;
  }

  public function getCardIds($player = null)
  {
    $player = $player ?? Players::getActive();
    $cardIds = [];
    foreach (Players::getAll() as $pId => $oppPlayer) {
      if ($pId == $player->getId()) {
        continue;
      }
      $cardIds[$pId] = $oppPlayer->getTimeline()->getIds();
    }
    return $cardIds;
  }

  public function isAutomatic($player = null)
  {
    $cardIds = $this->getCardIds($player);
    foreach ($cardIds as $pId => $cIds) {
      if (count($cIds) > 1) {
        return false;
      }
    }
    return true;
  }

  public function argsAddKnowledge()
  {
    $player = Players::getActive();
    return [
      'cardIds' => $this->getCardIds($player),
      'n' => $this->getN(),
    ];
  }

  public function stAddKnowledge()
  {
    $player = Players::getActive();
    $cardIds = $this->getCardIds($player);
    $choices = [];
    foreach ($cardIds as $pId => $cIds) {
      if (count($cIds) > 1) {
        return;
      }
      if (count($cIds) == 1) {
        $choices[$pId] = $cIds[0];
      }
    }

    $this->actAddKnowledge($choices, true);
  }

  public function actAddKnowledge($choices, $auto = false)
  {
    // Sanity checks
    self::checkAction('actAddKnowledge', $auto);
    $player = Players::getActive();
    $cardIds = $this->getCardIds($player);
    foreach ($cardIds as $pId => $cIds) {
      if (!isset($choices[$pId])) {
        if (count($cIds) > 0) {
          throw new \BgaVisibleSystemException('You must select one building in everyone else\'s timeline. Should not happen');
        }
      } else {
        if (!in_array($choices[$pId], $cIds[$pId])) {
          throw new \BgaVisibleSystemException('Invalid choice of card for some player. Should not happen');
        }
      }
    }

    // Add knowledges
    $cards = Cards::getMany(array_values($choices));
    $n = $this->getN();
    foreach ($cards as $cardId => $card) {
      $card->incKnowledge($n);
    }

    $sourceId = $this->getSourceId();
    Notifications::addKnowledge($player, $n, $cards, $sourceId);
    $this->resolveAction();
  }
}
