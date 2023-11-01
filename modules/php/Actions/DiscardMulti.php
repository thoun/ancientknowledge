<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Core\Game;
use AK\Core\Globals;
use AK\Helpers\Utils;

class DiscardMulti extends \AK\Models\Action
{
  public function getState()
  {
    return ST_DISCARD_MULTI;
  }

  public function getDescription()
  {
    $location = $this->getLocation();
    if ($location == 'hand') {
      return [
        'log' => clienttranslate('Other players discard ${n} card(s)'),
        'args' => [
          'n' => $this->getN(),
        ],
      ];
    }
    if ($location == 'artefact') {
      return [
        'log' => clienttranslate('Other players discard ${n} artefact(s)'),
        'args' => [
          'n' => $this->getN(),
        ],
      ];
    }

    die('DiscardMulti: unsupported location');
  }

  public function isIrreversible($player = null)
  {
    return true;
  }

  public function getN()
  {
    return $this->getCtxArg('n') ?? 1;
  }

  public function getLocation()
  {
    return $this->getCtxArg('location') ?? 'hand';
  }

  public function stDiscardMulti()
  {
    Globals::setMultiChoices([]);
    $gamestate = Game::get()->gamestate;
    $pIds = $gamestate->getActivePlayerList();
    $args = $this->argsDiscardMulti();
    foreach ($pIds as $pId) {
      $cardIds = $args['_private'][$pId]['cardIds'];
      if (count($cardIds) <= 1) {
        $this->discardMulti(Players::get($pId), $cardIds, false);
      }
    }
    $this->updateActivePlayers();
  }

  public function argsDiscardMulti()
  {
    $location = $this->getLocation();
    $args = ['n' => $this->getN()];
    foreach (Players::getAll() as $pId => $player) {
      $cards = $location == 'hand' ? $player->getHand() : $player->getArtefacts();
      $args['_private'][$pId] = [
        'cardIds' => $cards->getIds(),
        'canSkip' => $cards->empty(),
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
    if (count($cardIds) != $args['n'] && count($cardIds) != count($args['_private'][$player->getId()]['cardIds'])) {
      throw new \BgaVisibleSystemException('Invalid number of cards to discard. Should not happen');
    }
    if (!empty(array_diff($cardIds, $args['_private'][$player->getId()]['cardIds']))) {
      throw new \BgaVisibleSystemException('Invalid cards to discard. Should not happen');
    }

    $this->discardMulti($player, $cardIds);
  }

  public function discardMulti($player, $cardIds, $updateActivePlayers = true)
  {
    // Discard cards
    if (count($cardIds) > 0) {
      $cards = Cards::getMany($cardIds);
      Cards::discard($cardIds);
      Notifications::discardCards($player, $cards);
    }

    // Make the player inactive
    $choices = Globals::getMultiChoices();
    $choices[$player->getId()] = $cardIds;
    Globals::setMultiChoices($choices);

    $pIds = array_diff(Globals::getMultiPIds(), array_keys($choices));
    if ($updateActivePlayers) {
      $this->updateActivePlayers();
    }
  }

  public function updateActivePlayers()
  {
    $choices = Globals::getMultiChoices();
    $pIds = array_diff(Globals::getMultiPIds(), array_keys($choices));

    $gamestate = Game::get()->gamestate;
    if (empty($pIds)) {
      // activate previous player & trigger engine
      $gamestate->changeActivePlayer($this->getCtxArg('current'));
      $this->resolveAction([], true);
    } else {
      $gamestate->setPlayersMultiactive($pIds, 'next', true);
    }
  }
}
