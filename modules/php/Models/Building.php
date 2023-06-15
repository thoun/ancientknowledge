<?php
namespace AK\Models;
use AK\Core\Stats;
use AK\Core\Notifications;
use AK\Core\Preferences;
use AK\Managers\Actions;
use AK\Managers\Meeples;
use AK\Core\Globals;
use AK\Core\Engine;
use AK\Helpers\FlowConvertor;
use AK\Helpers\Utils;

/*
 * Building: all utility functions concerning a building
 */

class Building extends \AK\Helpers\DB_Model
{
  protected $table = 'cards';
  protected $primary = 'card_id';
  protected $attributes = [
    'id' => 'card_id',
    'location' => 'card_location',
    'state' => ['card_state', 'int'],
    'pId' => ['player_id', 'int'],
    'knowledge' => ['knowledge', 'int'],
  ];

  protected $staticAttributes = [
    ['number', 'int'],
    ['name', 'str'],
    ['text', 'obj'],
    ['country', 'str'],
    ['startingHand', 'int'],
    ['startingSpace', 'int'],
    ['initialKnowledge', 'int'],
    ['victoryPoint', 'int'],
    ['discard', 'int'],
    ['locked', 'bool'],
    ['activation', 'string'],
    ['effect', 'obj'],

    ['implemented', 'bool'],
  ];

  public function isArtefact()
  {
    return false;
  }

  public function getInitialKnowledgeDiscount()
  {
    return 0;
  }

  public function getReward($n = 1, $mapBonuses = null)
  {
    $player = $this->getPlayer();
    if (in_array($n, ICONS)) {
      $n = $player->countIcon($n);
    }

    $g = 0;
    foreach ($mapBonuses as $v => $gain) {
      if ($n >= $v) {
        $g = $gain;
      }
    }
    return $g;
  }

  /**
   * Event modifiers template
   **/
  public function isListeningTo($event)
  {
    return false;
  }
}
