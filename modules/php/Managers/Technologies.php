<?php
namespace AK\Managers;

use BgaVisibleSystemException;
use AK\Core\Stats;
use AK\Core\Globals;
use AK\Core\Notifications;
use AK\Helpers\UserException;
use AK\Helpers\Collection;

/* Class to manage all the tech cards for Ancient Knowledge */

class Technologies extends \AK\Helpers\CachedPieces
{
  protected static $datas = null;
  protected static $table = 'technologies';
  protected static $prefix = 'technology_';
  protected static $customFields = ['player_id'];
  protected static $autoIncrement = false;
  protected static $autoremovePrefix = false;
  protected static $autoreshuffle = true;
  protected static $autoreshuffleCustom = ['deck_1' => 'discard_1', 'deck_2' => 'discard_2'];
  protected static $autoreshuffleListener = ['obj' => 'AK\Managers\Technologies', 'method' => 'onReformDeck'];

  protected static function cast($card)
  {
    return self::getCardInstance($card['technology_id'], $card);
  }

  public static function getCardInstance($id, $data = null)
  {
    $className = "\AK\Technologies\\$id";
    return new $className($data);
  }

  public static function getUiData()
  {
    return self::getInLocation('board_%')->toArray();
  }

  ///////////////////////////////////
  //  ____       _
  // / ___|  ___| |_ _   _ _ __
  // \___ \ / _ \ __| | | | '_ \
  //  ___) |  __/ |_| |_| | |_) |
  // |____/ \___|\__|\__,_| .__/
  //                      |_|
  ///////////////////////////////////

  /* Creation of the cards */
  public static function setupNewGame($players, $options)
  {
    // Load list of cards
    include dirname(__FILE__) . '/../Technologies/list.inc.php';

    // Create cards
    $techs = [];
    foreach ($techIds as $tId) {
      $tech = self::getCardInstance($tId);

      $data = [
        'id' => $tId,
        'location' => 'deck_' . $tech->getLevel(),
      ];

      $techs[$tId] = $data;
    }

    // Create the techs
    self::create($techs, null);
    self::shuffle('deck_1');
    self::shuffle('deck_2');
  }

  public static function initialDraw()
  {
    $techs = self::pickForLocation(3, 'deck_1', 'board_1')
      ->merge(self::pickForLocation(3, 'deck_1', 'board_2'))
      ->merge(self::pickForLocation(3, 'deck_2', 'board_3'));

    Notifications::fillPool($techs);
  }

  //////////////////////////
  //  ____             _
  // |  _ \ ___   ___ | |
  // | |_) / _ \ / _ \| |
  // |  __/ (_) | (_) | |
  // |_|   \___/ \___/|_|
  //////////////////////////

  /**
   * Return the cards in the pool
   */
  public static function getPool($type = null)
  {
    return self::getInLocation('board_%')->where('type', $type);
  }

  public static function getBoard($board)
  {
    return self::getInLocation("board_$board");
  }

  public static function getCorrespondingDeckId($board)
  {
    $t = Globals::getSecondLvl2TechTile();
    return $board == 3 || ($board == $t && !Globals::isFirstHalf()) ? 2 : 1;
  }

  public static function canRefillBoard($board, $n = 3)
  {
    $deckId = self::getCorrespondingDeckId($board);
    return self::countInLocation("deck_$deckId") + self::countInLocation("discard_$deckId") >= $n;
  }

  public static function onReformDeck($deck)
  {
    Notifications::reformTechDeck($deck);
  }

  ///////////////////////////////////////////////
  //    ____                                 _
  //   |  _ \ ___ _ __ ___  ___  _ __   __ _| |
  //   | |_) / _ \ '__/ __|/ _ \| '_ \ / _` | |
  //   |  __/  __/ |  \__ \ (_) | | | | (_| | |
  //   |_|   \___|_|  |___/\___/|_| |_|\__,_|_|
  ///////////////////////////////////////////////

  /**
   * Get all tech tiles played
   */
  public static function getOfPlayer($pId, $type = null)
  {
    return self::getFiltered($pId, 'inPlay')->where('type', $type);
  }
}
