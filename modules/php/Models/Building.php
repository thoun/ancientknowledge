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
    'location' => 'location',
    'state' => 'state',
    'pId' => ['player_id', 'int'],
  ];

  protected $staticAttributes = [
    ['number', 'int'],
    ['name', 'str'],
    ['text', 'obj'],
    ['country', 'str'],
    ['startingSpace', 'int'],
    ['initialKnowledge', 'int'],
    ['victoryPoint', 'int'],
    ['discard', 'int'],
    ['locked', 'bool'],
    ['activation', 'string'],
    ['effect', 'obj'],
  ];
}
