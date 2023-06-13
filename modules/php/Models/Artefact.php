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
  ];

  public function isArtefact()
  {
    return true;
  }
}
