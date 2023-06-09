<?php
namespace AK\Managers;

use BgaVisibleSystemException;
use AK\Core\Stats;
use AK\Core\Globals;
use AK\Helpers\UserException;
use AK\Helpers\Collection;

/* Class to manage all the cards for Ancient Knowledge */

class Cards extends \AK\Helpers\Pieces
{
  protected static $table = 'cards';
  protected static $prefix = 'card_';
  protected static $customFields = ['player_id'];
  protected static $autoIncrement = false;
  protected static $autoremovePrefix = false;
  protected static $autoreshuffle = true;
  protected static $autoreshuffleCustom = ['deck' => 'discard'];

  protected static function cast($card)
  {
    return self::getCardInstance($card['card_id'], $card);
  }

  public static function getCardInstance($id, $data = null)
  {
    $t = explode('_', $id);
    // First part before _ specify the type and the numbering
    $prefixes = [
      'C' => 'Cities',
      'M' => 'Monoliths',
      'P' => 'Pyramids',
      'A' => 'Artefacts',
    ];
    $prefix = $prefixes[$t[0][0]];
    $className = "\AK\Cards\\$prefix\\$id";
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
    include dirname(__FILE__) . '/../Cards/list.inc.php';

    foreach ($cardIds as $cId) {
      //   $card = self::getCardInstance($cId);
      //   if (!$card->isSupported($players, $options)) {
      //     continue;
      //   }

      $cards[$cId] = [
        'id' => $cId,
        'location' => 'deck',
      ];
    }

    // Create the cards
    self::create($cards, null);
    self::shuffle('deck');
  }
}
