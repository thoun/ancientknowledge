<?php
namespace AK\Models;
use AK\Core\Stats;
use AK\Core\Notifications;
use AK\Core\Preferences;
use AK\Managers\Actions;
use AK\Managers\Players;
use AK\Core\Globals;
use AK\Core\Engine;
use AK\Helpers\FlowConvertor;
use AK\Helpers\Utils;

/*
 * Artefact: all utility functions concerning an artefact
 */

class Artefact extends \AK\Helpers\DB_Model
{
  protected $table = 'cards';
  protected $primary = 'card_id';
  protected $attributes = [
    'id' => 'card_id',
    'location' => 'card_location',
    'state' => ['card_state', 'int'],
    'pId' => ['player_id', 'int'],
  ];

  protected $staticAttributes = [
    ['number', 'int'],
    ['name', 'str'],
    ['text', 'obj'],
    ['country', 'str'],
    ['startingHand', 'int'],
    ['discard', 'int'],
    ['activation', 'string'],
    ['effect', 'obj'],

    ['implemented', 'bool'],
  ];

  public function getType()
  {
    return ARTEFACT;
  }

  public function isArtefact()
  {
    return true;
  }

  public function getKnowledgeReduction($card)
  {
    return 0;
  }

  public function getPlayer()
  {
    return Players::get($this->pId);
  }

  public function countIcon($icon)
  {
    return $this->getPlayer()->countIcon($icon);
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

  /**
   * Event modifiers template
   **/
  public function isListeningTo($event)
  {
    return false;
  }
}
