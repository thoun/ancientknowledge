<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class RemoveKnowledge extends \AK\Models\Action
{
  public function getState()
  {
    return ST_REMOVE_KNOWLEDGE;
  }

  public function getDescription()
  {
    return [
      'log' => clienttranslate('Remove ${n} <KNOWLEDGE> on your timeline'),
      'args' => [
        'n' => $this->getN(),
      ],
    ];
  }

  public function getN()
  {
    return $this->getCtxArg('n') ?? 1;
  }

  public function getType()
  {
    return $this->getCtxArg('type') ?? \NODE_OR;
  }

  public function getCardIds($player = null)
  {
    $player = $player ?? Players::getActive();
    return $this->getCtxArg('cardIds') ??
      $player
        ->getTimeline()
        ->filter(function ($card) {
          return $card->getKnowledge() > 0;
        })
        ->getIds();
  }

  public function isAutomatic($player = null)
  {
    $type = $this->getType();
    if ($type == \NODE_SEQ) {
      return true;
    }

    $cardIds = $this->getCardIds($player);
    return count($cardIds) <= 1;
  }

  public function argsRemoveKnowledge()
  {
    $cardIds = $this->getCardIds();
    return [
      'n' => $this->getN(),
      'cardIds' => $cardIds,
      'type' => $this->getType(),
      'm' => $this->getCtxArg('m') ?? 1,
    ];
  }

  public function stRemoveKnowledge()
  {
    $n = $this->getN();
    $type = $this->getType();
    $cardIds = $this->getCardIds();

    // No targetable cards => pass
    if (empty($cardIds)) {
      $this->actPass();
    }
    // Only 1 targetable card => auto select it
    elseif (count($cardIds) == 1) {
      $choices = [$cardIds[0] => $n];
      $this->actRemoveKnowledge($choices, true);
    }
    // Node seq => auto remove on all cards
    elseif ($type == \NODE_SEQ) {
      $choices = [];
      foreach ($cardIds as $cardId) {
        $choices[$cardId] = $n;
      }
      $this->actRemoveKnowledge($choices, true);
    }
  }

  public function actRemoveKnowledge($choices, $auto = false)
  {
    // Sanity checks
    self::checkAction('actRemoveKnowledge', $auto);
    $player = Players::getActive();
    $args = $this->argsRemoveKnowledge();
    $cardIds = array_keys($choices);
    if (!empty(array_diff($cardIds, $args['cardIds']))) {
      throw new \BgaVisibleSystemException('Invalid cards. Should not happen');
    }
    $m = $this->getCtxArg('m') ?? 1;
    if ($args['type'] == NODE_XOR && count($choices) != $m && count($choices) != count($args['cardIds'])) {
      throw new \BgaVisibleSystemException("You should choose $m card to remove knowledge from. Should not happen");
    }

    // Remove knowledges
    $total = 0;
    $cards = Cards::getMany($cardIds);
    foreach ($cards as $cardId => $card) {
      $m = min($choices[$cardId], $card->getKnowledge());
      $card->incKnowledge(-$m);
      $total += $m;
    }

    if ($total > 0) {
      $sourceId = $this->getSourceId();
      Notifications::removeKnowledge($player, $total, $cards, $sourceId);
    }
    $this->resolveAction();
  }

  public function actPass()
  {
    $this->resolveAction();
  }
}
