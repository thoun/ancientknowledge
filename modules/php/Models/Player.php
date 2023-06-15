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
    'lostKnowledge' => ['lost_knowledge', 'int'],
  ];

  public function getUiData($currentPlayerId = null)
  {
    $data = parent::getUiData();
    $current = $this->id == $currentPlayerId;
    $hand = $this->getHand();
    $data['hand'] = $current ? $hand->ui() : [];
    $data['handCount'] = $hand->count();
    $data['timeline'] = $this->getTimeline()->ui();
    $data['past'] = $this->getPast()->ui();
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

  public function getTimeline($type = null)
  {
    return Cards::getTimeline($this->id, $type);
  }

  public function hasPlayedCard($id)
  {
    return Cards::hasPlayedCard($this->id, $id);
  }

  public function getPast($type = null)
  {
    return Cards::getPast($this->id, $type);
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

  public function countIcon($icon)
  {
    $icons = $this->countIcons();
    return $icons[$icon] ?? 0;
  }

  public function countIcons($toKeep = null)
  {
    $icons = [];
    // TODO

    // foreach (ALL_PREREQUISITES as $type) {
    //   $icons[$type] = 0;
    // }

    // $cards = $this->getPlayedCards();
    // foreach ($cards as $aId => $card) {
    //   foreach ($card->getIcons() as $type => $n) {
    //     $icons[$type] += $n;
    //   }
    // }

    // if ($this->hasUniversity(UNIVERSITY_SCIENCE_REP)) {
    //   $icons[SCIENCE]++;
    // }

    // if ($this->hasUniversity(UNIVERSITY_SCIENCE_SCIENCE)) {
    //   $icons[SCIENCE] += 2;
    // }

    // foreach ($this->getPartnerZoos() as $mId => $partner) {
    //   $continent = explode('-', $partner['type'])[1];
    //   $icons[$continent]++;
    // }
    // // TODO : manage map specific

    // if (!is_null($toKeep)) {
    //   foreach (array_keys($icons) as $type) {
    //     if (!in_array($type, $toKeep)) {
    //       unset($icons[$type]);
    //     }
    //   }
    // }

    // if ($onlyNonZero) {
    //   foreach (array_keys($icons) as $type) {
    //     if ($icons[$type] == 0) {
    //       unset($icons[$type]);
    //     }
    //   }
    // }

    // // Update stats
    // if (!$onlyNonZero && is_null($toKeep)) {
    //   foreach (ALL_PREREQUISITES as $type) {
    //     if (!in_array($type, CONTINENTS_AND_TYPES) && !in_array($type, [WATER, ROCK, SCIENCE])) {
    //       continue;
    //     }

    //     $val = $icons[$type];
    //     $statName = 'getIcon' . $type;
    //     if (Stats::$statName($this) != $val) {
    //       $statName = 'setIcon' . $type;
    //       Stats::$statName($this, $val);
    //     }
    //   }
    // }

    return $icons;
  }
}
