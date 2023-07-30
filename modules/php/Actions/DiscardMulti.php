<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Core\Game;
use AK\Helpers\Utils;

class DiscardMulti extends \AK\Models\Action
{
  public function getState()
  {
    return ST_DISCARD_MULTI;
  }

  public function getDescription()
  {
    return [
      'log' => clienttranslate('Other players discard ${n} card(s)'),
      'args' => [
        'n' => $this->getN(),
      ],
    ];
  }

  public function isIrreversible($player = null)
  {
    return true;
  }

  public function getN()
  {
    return $this->getCtxArg('n') ?? 1;
  }

  public function argsDiscardMulti()
  {
    $args = ['n' => $this->getN()];
    foreach (Players::getAll() as $pId => $player) {
      $hand = $player->getHand();
      $args['_private'][$pId] = [
        'cardIds' => $hand->getIds(),
      ];
    }
    return $args;
  }

  public function actDiscardMulti($cardIds)
  {
    // Sanity checks
    self::checkAction('actDiscardMulti');
    $player = Players::getCurrent();
    $args = $this->argsDiscardMulti();
    if (count($cardIds) != $args['n']) {
      throw new \BgaVisibleSystemException('Invalid number of cards to discard. Should not happen');
    }
    if (!empty(array_diff($cardIds, $args['_private'][$player->getId()]['cardIds']))) {
      throw new \BgaVisibleSystemException('Invalid cards to discard. Should not happen');
    }

    // Discard cards
    $cards = Cards::getMany($cardIds);
    Cards::discard($cardIds);
    Notifications::discardCards($player, $cards);

    // Make the player inactive
    $gamestate = Game::get()->gamestate;
    $gamestate->setPlayerNonMultiactive($player->getId(), 'next');
    if (count($gamestate->getActivePlayerList()) == 0) {
      // activate previous player & trigger engine
      $gamestate->changeActivePlayer($this->getCtxArg('current'));
      $this->resolveAction([], true);
    }
  }
}