<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class AddKnowledgeFromBoard extends \AK\Models\Action
{
  public function getState()
  {
    return ST_ADD_KNOWLEDGE_FROM_BOARD;
  }

  public function getDescription()
  {
    return [
      'log' => clienttranslate('Add ${n} <KNOWLEDGE> to one monument in one opponent\'s timeline'),
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
    if ($player->getLostKnowledge() == 0) {
      return false;
    }

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

  public function getTarget($player)
  {
    $cardId = null;
    foreach ($this->getCardIds($player) as $pId => $cIds) {
      if (count($cIds) > 2) {
        return null;
      }
      if (count($cIds) == 1) {
        if (is_null($cardId)) {
          $cardId = $cIds[0];
        } else {
          return null;
        }
      }
    }
    return $cardId;
  }

  public function isAutomatic($player = null)
  {
    $cardId = $this->getTarget();
    return !is_null($cardId);
  }

  public function argsAddKnowledgeFromBoard()
  {
    $player = Players::getActive();
    return [
      'cardIds' => $this->getCardIds($player),
      'n' => $this->getN(),
    ];
  }

  public function stAddKnowledgeFromBoard()
  {
    $cardId = $this->getTarget();
    if (!is_null($cardId)) {
      $this->actAddKnowledgeFromBoard($cardId, true);
    }
  }

  public function actAddKnowledgeFromBoard($cardId, $auto = false)
  {
    // Sanity checks
    self::checkAction('actAddKnowledgeFromBoard', $auto);
    $player = Players::getActive();
    $cardIds = $this->getCardIds($player);
    $targetPId = null;
    foreach ($cardIds as $pId => $cIds) {
      if (in_array($cardId, $cIds)) {
        $targetPId = $cardId;
      }
    }
    if (is_null($targetPId)) {
      throw new \BgaVisibleSystemException('Invalid card choice. Should not happen');
    }

    // Add knowledges and remove them from board
    $cards = Cards::getSingle($cardId);
    $n = min($player->getLostKnowledge(), $this->getN());
    $card->incKnowledge($n);
    $player->incLostKnowledge(-$n);

    $targetPlayer = Players::get($targetPId);
    $sourceId = $this->getSourceId();
    Notifications::addKnowledgeFromBoard($player, $targetPlayer, $n, $card, $sourceId);
    $this->resolveAction();
  }
}
