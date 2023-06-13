<?php
namespace AK\Models;
use AK\Core\Stats;
use AK\Core\Notifications;
use AK\Core\Preferences;
use AK\Managers\Actions;
use AK\Managers\Meeples;
use AK\Managers\Cards;
use AK\Core\Globals;
use AK\Core\Engine;
use AK\Helpers\FlowConvertor;
use AK\Helpers\Utils;

/*
 * Player: all utility functions concerning a player
 */

class Player extends \AK\Helpers\DB_Model
{
  private $map = null;
  protected $table = 'player';
  protected $primary = 'player_id';
  protected $attributes = [
    'id' => ['player_id', 'int'],
    'no' => ['player_no', 'int'],
    'name' => 'player_name',
    'color' => 'player_color',
    'eliminated' => 'player_eliminated',
    'score' => ['player_score', 'int'],
    'scoreAux' => ['player_score_aux', 'int'],
    'zombie' => 'player_zombie',
    'lost_knowledge' => ['lost_knowledge', 'int'],
  ];

  public function getUiData($currentPlayerId = null)
  {
    $data = parent::getUiData();
    $current = $this->id == $currentPlayerId;
    $hand = $this->getHand();
    $data['hand'] = $current ? $hand : [];
    $data['handCount'] = $hand->count();
    return $data;
  }

  public function getPref($prefId)
  {
    return Preferences::get($this->id, $prefId);
  }

  public function getStat($name)
  {
    $name = 'get' . \ucfirst($name);
    return Stats::$name($this->id);
  }

  public function canTakeAction($action, $ctx)
  {
    return Actions::isDoable($action, $ctx, $this);
  }

  public function getHand($type = null)
  {
    return Cards::getHand($this->id, $type);
  }

  public function getFreeSlots()
  {
    // TODO
    $slots = [];
    for ($i = 1; $i <= 6; $i++) {
      $slots[$i] = "timeline-$i-0";
    }

    return $slots;
  }

  public function getFreeArtefactSlot()
  {
    // TODO
    return 'artefact-0';
  }
}
