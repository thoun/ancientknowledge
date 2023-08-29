<?php
namespace AK\States;
use AK\Core\Globals;
use AK\Core\Notifications;
use AK\Core\Engine;
use AK\Core\Stats;
use AK\Helpers\Log;
use AK\Managers\Players;
use AK\Managers\Meeples;
use AK\Managers\Cards;
use AK\Managers\Actions;
use AK\Managers\Scores;

trait TurnTrait
{
  function actOrderCards($cardIds)
  {
    $player = Players::getCurrent();
    foreach ($cardIds as $i => $cardId) {
      $card = Cards::getSingle($cardId);
      if (is_null($card) || $card->isPlayed() || $card->getPId() != $player->getId()) {
        throw new \BgaVisibleSystemException("You can't reorder that card:" . $card->getId());
      }

      Cards::setState($cardId, $i);
    }
  }

  /**
   * Start Engine
   */
  function stTurnAction()
  {
    $player = Players::getActive();
    self::giveExtraTime($player->getId());

    if (Globals::isEndOfGameTriggered() && $player->getId() == Globals::getFirstPlayer()) {
      $this->endOfGameInit();
      return;
    }

    // Stats::incTurns($player);
    $node = [
      'childs' => [
        [
          'action' => CHOOSE_ACTION,
          'pId' => $player->getId(),
          'args' => ['n' => 1],
        ],
        [
          'action' => CHOOSE_ACTION,
          'pId' => $player->getId(),
          'args' => ['n' => 2],
        ],
        [
          'action' => TIMELINE_PHASE,
          'pId' => $player->getId(),
        ],
        [
          'action' => DECLINE_PHASE,
          'pId' => $player->getId(),
        ],
      ],
    ];

    // Inserting leaf Action card
    Engine::setup($node, ['method' => 'stEndOfTurn']);
    Engine::proceed();
  }

  /**
   * End of turn
   */
  function stEndOfTurn()
  {
    $this->nextPlayerCustomOrder('turn');
  }

  /*******************************
   ********************************
   ********** END OF GAME *********
   ********************************
   *******************************/
  function endOfGameInit()
  {
    Globals::setLiveScoring(true);
    Scores::update(true);

    $this->gamestate->jumpToState(\ST_PRE_END_OF_GAME);
    // $this->gamestate->jumpToState(\ST_END_GAME);
  }
}
