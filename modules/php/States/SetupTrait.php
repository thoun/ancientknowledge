<?php
namespace AK\States;
use AK\Core\Globals;
use AK\Core\Notifications;
use AK\Core\Engine;
use AK\Core\Stats;
use AK\Core\Preferences;
use AK\Managers\Players;
use AK\Managers\Cards;
use AK\Managers\Actions;
use AK\Helpers\Utils;
use AK\Helpers\Log;

trait SetupTrait
{
  /*
   * setupNewGame:
   */
  protected function setupNewGame($players, $options = [])
  {
    Globals::setupNewGame($players, $options);
    Players::setupNewGame($players, $options);
    Preferences::setupNewGame($players, $this->player_preferences);
    //        Meeples::setupNewGame($players, $options);
    Cards::setupNewGame($players, $options);
    // Stats::checkExistence();

    Globals::setFirstPlayer($this->getNextPlayerTable()[0]);

    $this->setGameStateInitialValue('logging', true);
    $this->activeNextPlayer();
  }
}
