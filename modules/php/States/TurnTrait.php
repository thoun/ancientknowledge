<?php
namespace AK\States;
use AK\Core\Globals;
use AK\Core\Notifications;
use AK\Core\Engine;
use AK\Core\Stats;
use AK\Helpers\Log;
use AK\Managers\Players;
use AK\Managers\Meeples;
use AK\Managers\Actions;

trait TurnTrait
{
  /**
   * State function when starting a turn
   *  useful to intercept for some cards that happens at that moment
   */
  function stPreAmbassadorPhase()
  {
    $skipped = Players::getAll()
      ->filter(function ($player) {
        return $player->isZombie();
      })
      ->getIds();
    Globals::setSkippedPlayers($skipped);
    //TODO use president as first player
    $this->initCustomDefaultTurnOrder('ambassador', ST_AMBASSADOR_PHASE, ST_EXECUTIVE_PHASE, true);
  }

  /*************************************
   *************************************
   ********** AMBASSADOR PHASE *********
   *************************************
   ************************************/

  /**
   * Activate next player
   */
  function stAmbassadorPhase()
  {
    $player = Players::getActive();

    // Already out of round ? => Go to the next player if one is left
    $skipped = Globals::getSkippedPlayers();
    if (in_array($player->getId(), $skipped)) {
      // Everyone is out of round => end it
      $remaining = array_diff(Players::getAll()->getIds(), $skipped);
      if (empty($remaining)) {
        $this->endCustomOrder('ambassador');
      } else {
        $this->nextPlayerCustomOrder('ambassador');
      }
      return;
    }
    self::giveExtraTime($player->getId());

    $node = [
      'action' => PLACE_AMBASSADOR,
      'pId' => $player->getId(),
    ];

    // Inserting leaf Action card
    Engine::setup($node, ['method' => 'stEndOfTurn']);
    Engine::proceed();
  }

  /**
   * End of turn : replenish and check break
   */
  function stEndOfTurn()
  {
    $player = Players::getActive();
    // No Ambassador to allocate ?
    if (!$player->hasAmbassadorAvailable()) {
      $skipped = Globals::getSkippedPlayers();
      $skipped[] = $player->getId();
      Globals::setSkippedPlayers($skipped);
    }
    $this->nextPlayerCustomOrder('ambassador');
  }

  /************************************
   ************************************
   ********** EXECUTIVE PHASE *********
   ************************************
   ***********************************/

  function stPreEndOfGame()
  {
    Log::clearUndoableStepNotifications(true);
    Globals::setEnd(true);
    $this->gamestate->nextState('');
  }
}
