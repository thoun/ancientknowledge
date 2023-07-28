<?php
namespace AK\Actions;
use AK\Managers\Meeples;
use AK\Managers\Players;
use AK\Managers\Cards;
use AK\Core\Notifications;
use AK\Core\Engine;
use AK\Core\Globals;
use AK\Helpers\Utils;
use AK\Managers\Effects;

class ActivateCard extends \AK\Models\Action
{
  public function getState()
  {
    return ST_ACTIVATE_CARD;
  }

  public function getCard()
  {
    return Effects::get($this->getCtxArg('cardId'));
  }

  public function getFlow($player)
  {
    $card = $this->getCard();
    // if (!$card->isPlayed()) {
    //   return null;
    // }

    $activation = $this->getCtxArg('activation');
    if (!is_null($activation)) {
      return Effects::getActivationEffect($card, $activation);
    }

    $args = $this->getCtxArg('event');
    return Effects::applyEffect(
      $card,
      $player,
      $this->getCtxArg('event')['method'],
      $args,
      true // Throw error if no such listener
    );
  }

  public function getFlowTree($player)
  {
    $flow = $this->getFlow($player);
    return is_null($flow) ? null : Engine::buildTree($flow);
  }

  public function isOptional()
  {
    $player = $this->getPlayer();
    if (is_null($this->getFlowTree($player))) {
      return true;
    }
    return $this->getFlowTree($player)->isOptional();
  }

  public function isAutomatic($player = null)
  {
    return true;
  }

  public function isDoable($player, $ignoreResources = false)
  {
    $flowTree = $this->getFlowTree($player);
    return is_null($flowTree) ? false : $flowTree->isDoable($player, $ignoreResources);
  }

  public function isIndependent($player = null)
  {
    $flowTree = $this->getFlowTree($player);
    return is_null($flowTree) ? false : $flowTree->isIndependent($player);
  }

  public function isIrreversible($player = null)
  {
    $flowTree = $this->getFlowTree($player);
    return is_null($flowTree) ? false : $flowTree->isIrreversible($player);
  }

  public function getDescription($ignoreResources = false)
  {
    $flowTree = $this->getFlowTree($this->getPlayer());
    if (is_null($flowTree)) {
      return '';
    }

    $flowDesc = $flowTree->getDescription($ignoreResources);
    return [
      'log' => '${flowDesc} (${source})',
      'args' => [
        'i18n' => ['flowDesc', 'source'],
        'flowDesc' => $flowDesc,
        'source' => $this->getCard()->getName(),
      ],
    ];
  }

  public function stActivateCard()
  {
    $player = $this->getPlayer();
    $node = $this->ctx;
    $flow = $this->getFlow($player);
    if ($node->isOptional()) {
      $flow['optional'] = false; // Remove optional to avoid double confirmation UX
    }
    // Add tag about that card
    $flow = Utils::tagTree($flow, [
      'sourceId' => $this->getCtxArgs()['cardId'],
    ]);

    $node->replace(Engine::buildTree($flow));
    Engine::save();
    Engine::proceed();
  }
}
