<?php
namespace AK\Managers;

use BgaVisibleSystemException;
use AK\Core\Stats;
use AK\Core\Globals;
use AK\Core\Notifications;
use AK\Helpers\UserException;
use AK\Helpers\Collection;

/* Class to manage all the tech cards for Ancient Knowledge */

class Technologies extends \AK\Helpers\Pieces
{
  protected static $table = 'technologies';
  protected static $prefix = 'technology_';
  protected static $customFields = ['player_id'];
  protected static $autoIncrement = false;
  protected static $autoremovePrefix = false;
  protected static $autoreshuffle = true;
  protected static $autoreshuffleCustom = ['deck' => 'discard'];

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
    return self::getAll()->ui();
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
}
