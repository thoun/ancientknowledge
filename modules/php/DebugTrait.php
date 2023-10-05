<?php
namespace AK;
use AK\Managers\Players;
use AK\Managers\Meeples;
use AK\Managers\Cards;
use AK\Managers\Scores;
use AK\Core\Globals;
use AK\Core\Engine;
use AK\Core\Game;
use AK\Core\Notifications;
use AK\Helpers\Utils;
use AK\Helpers\Log;
use AK\Helpers\Collection;

trait DebugTrait
{
  function triggerEnd()
  {
    Globals::setEndOfGameTriggered(true);
    Notifications::endOfGameTriggered(Players::getCurrent());
  }

  function scores()
  {
    Scores::compute(true);
  }

  function tp()
  {
    // $this->actTakeAtomicAction('actDiscardMulti', [['P10_Teotihuacan', 'P14_TikalTempleI']]);
    // $this->actTakeAtomicAction('actDrawAndKeep', ['A28_DogUFigurines']);
    $this->actTakeAtomicAction('actFlipTechTile', [1]);
  }

  // addCardsToPast(6)
  function addCardsToPast($n = 1)
  {
    for ($i = 0; $i < $n; ) {
      $card = Cards::getTopOf('deck', 1)->first();
      if ($card->getType() == ARTEFACT) {
        Cards::insertOnTop($card->getId(), 'hand');
      } else {
        self::addPast($card->getId());
        $i++;
      }
    }
  }

  // addHand(M15_BarabarCaves)
  // addHand(M24_TlalocsStatue)
  function addHand($cardId)
  {
    $player = Players::getCurrent();
    $card = Cards::get($cardId);
    Cards::insertOnTop($cardId, 'hand');
    $card->setPId($player->getId());
    Notifications::drawCards($player, [$card], null);
    Engine::proceed();
  }

  // addPast(P10_Teotihuacan)
  function addPast($cardId)
  {
    $player = Players::getCurrent();
    $pId = $player->getId();
    $card = Cards::get($cardId);
    Cards::insertOnTop($cardId, 'past');
    $card->setPId($player->getId());
    Notifications::declineCard($player, $card, 0);
    Engine::proceed();
  }

  function engDisplay()
  {
    var_dump(Globals::getEngine());
  }

  function engProceed()
  {
    Engine::proceed();
  }

  /*
   * loadBug: in studio, type loadBug(20762) into the table chat to load a bug report from production
   * client side JavaScript will fetch each URL below in sequence, then refresh the page
   */
  public function loadBug($reportId)
  {
    $db = explode('_', self::getUniqueValueFromDB("SELECT SUBSTRING_INDEX(DATABASE(), '_', -2)"));
    $game = $db[0];
    $tableId = $db[1];
    self::notifyAllPlayers(
      'loadBug',
      "Trying to load <a href='https://boardgamearena.com/bug?id=$reportId' target='_blank'>bug report $reportId</a>",
      [
        'urls' => [
          // Emulates "load bug report" in control panel
          "https://studio.boardgamearena.com/admin/studio/getSavedGameStateFromProduction.html?game=$game&report_id=$reportId&table_id=$tableId",

          // Emulates "load 1" at this table
          "https://studio.boardgamearena.com/table/table/loadSaveState.html?table=$tableId&state=1",

          // Calls the function below to update SQL
          "https://studio.boardgamearena.com/1/$game/$game/loadBugSQL.html?table=$tableId&report_id=$reportId",

          // Emulates "clear PHP cache" in control panel
          // Needed at the end because BGA is caching player info
          "https://studio.boardgamearena.com/admin/studio/clearGameserverPhpCache.html?game=$game",
        ],
      ]
    );
  }

  /*
   * loadBugSQL: in studio, this is one of the URLs triggered by loadBug() above
   */
  public function loadBugSQL($reportId)
  {
    $studioPlayer = self::getCurrentPlayerId();
    $players = self::getObjectListFromDb('SELECT player_id FROM player', true);

    // Change for your game
    // We are setting the current state to match the start of a player's turn if it's already game over
    $sql = ['UPDATE global SET global_value=2 WHERE global_id=1 AND global_value=99'];
    $map = [];
    foreach ($players as $pId) {
      $map[(int) $pId] = (int) $studioPlayer;

      // All games can keep this SQL
      $sql[] = "UPDATE player SET player_id=$studioPlayer WHERE player_id=$pId";
      $sql[] = "UPDATE global SET global_value=$studioPlayer WHERE global_value=$pId";
      $sql[] = "UPDATE stats SET stats_player_id=$studioPlayer WHERE stats_player_id=$pId";

      // Add game-specific SQL update the tables for your game
      $sql[] = "UPDATE meeples SET player_id=$studioPlayer WHERE player_id=$pId";
      $sql[] = "UPDATE user_preferences SET player_id=$studioPlayer WHERE player_id=$pId";

      // This could be improved, it assumes you had sequential studio accounts before loading
      // e.g., quietmint0, quietmint1, quietmint2, etc. are at the table
      $studioPlayer++;
    }
    $msg =
      "<b>Loaded <a href='https://boardgamearena.com/bug?id=$reportId' target='_blank'>bug report $reportId</a></b><hr><ul><li>" .
      implode(';</li><li>', $sql) .
      ';</li></ul>';
    self::warn($msg);
    self::notifyAllPlayers('message', $msg, []);

    foreach ($sql as $q) {
      self::DbQuery($q);
    }

    /******************
     *** Fix Globals ***
     ******************/

    // Turn orders
    $turnOrders = Globals::getCustomTurnOrders();
    foreach ($turnOrders as $key => &$order) {
      $t = [];
      foreach ($order['order'] as $pId) {
        $t[] = $map[$pId];
      }
      $order['order'] = $t;
    }
    Globals::setCustomTurnOrders($turnOrders);

    // Engine
    $engine = Globals::getEngine();
    self::loadDebugUpdateEngine($engine, $map);
    Globals::setEngine($engine);

    // First player
    $fp = Globals::getFirstPlayer();
    Globals::setFirstPlayer($map[$fp]);

    self::reloadPlayersBasicInfos();
  }

  function loadDebugUpdateEngine(&$node, $map)
  {
    if (isset($node['pId'])) {
      $node['pId'] = $map[(int) $node['pId']];
    }

    if (isset($node['childs'])) {
      foreach ($node['childs'] as &$child) {
        self::loadDebugUpdateEngine($child, $map);
      }
    }
  }
}
