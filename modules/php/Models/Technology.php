<?php
namespace AK\Models;
use AK\Core\Stats;
use AK\Core\Notifications;
use AK\Core\Preferences;
use AK\Managers\Actions;
use AK\Managers\Meeples;
use AK\Managers\Players;
use AK\Core\Globals;
use AK\Core\Engine;
use AK\Helpers\FlowConvertor;
use AK\Helpers\Utils;

/*
 * Technology: all utility functions concerning a tech
 */

class Technology extends \AK\Helpers\DB_Model
{
  protected $table = 'technologies';
  protected $primary = 'technology_id';
  protected $attributes = [
    'id' => 'technology_id',
    'location' => 'technology_location',
    'state' => ['technology_state', 'int'],
    'pId' => ['player_id', 'int'],
  ];

  protected $staticAttributes = [
    ['number', 'int'],
    ['name', 'str'],
    ['type', 'str'],
    ['level', 'int'],
    ['requirement', 'obj'],
    ['activation', 'string'],
    ['effect', 'obj'],
  ];

  public function canBePlayed($player)
  {
    return true;
  }

  public function getPlayer()
  {
    return Players::get($this->pId);
  }

  protected function isPlayerEvent($event)
  {
    return $this->pId == $event['pId'];
  }

  protected function isActionEvent($event, $action, $playerConstraint = 'player')
  {
    return $event['type'] == 'action' &&
      $event['action'] == $action &&
      (is_null($playerConstraint) ||
        ($playerConstraint == 'player' && $this->pId == $event['pId']) ||
        ($playerConstraint == 'opponent' && $this->pId != $event['pId'])) &&
      $event['method'] == 'After' . $action;
  }

  public function countIcon($icon)
  {
    return $this->getPlayer()->countIcon($icon);
  }

  public function getBoard()
  {
    $t = explode('_', $this->location);
    return $t[0] == 'board' ? ((int) $t[1]) : null;
  }

  /**
   * Event modifiers template
   **/
  public function isListeningTo($event)
  {
    return false;
  }
}
