<?php
namespace AK\Models;
use AK\Core\Stats;
use AK\Core\Notifications;
use AK\Core\Preferences;
use AK\Managers\Actions;
use AK\Managers\Technologies;
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
    $data['hand'] = $current ? $hand->toArray() : [];
    $data['handCount'] = $hand->count();
    $data['timeline'] = $this->getTimeline()->toArray();
    $data['artefacts'] = $this->getArtefacts()->toArray();
    $data['past'] = $this->getPast()->toArray();
    $data['techs'] = $this->getTechTiles()->toArray();
    $data['icons'] = $this->getIcons();
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

  public function getArtefacts()
  {
    return Cards::getArtefacts($this->id);
  }

  public function hasPlayedCard($id)
  {
    return Cards::hasPlayedCard($this->id, $id);
  }

  public function getPast($type = null)
  {
    return Cards::getPast($this->id, $type);
  }

  public function getCardOnTimelineSpace($space)
  {
    return Cards::getOnTimelineSpace($this->id, $space);
  }

  public function getTechTiles($type = null)
  {
    return Technologies::getOfPlayer($this->id, $type);
  }

  public function countKnowledgeOnTimeline()
  {
    $knowledge = 0;
    foreach ($this->getTimeline() as $card) {
      $knowledge += $card->getKnowledge();
    }
    return $knowledge;
  }

  public function getFreeSlots()
  {
    $taken = $this->getTimeline()
      ->map(function ($card) {
        return $card->getLocation();
      })
      ->toArray();

    $slots = [];
    for ($i = 1; $i <= 6; $i++) {
      $slot0 = "timeline-$i-0";
      $slot1 = "timeline-$i-1";
      if (!in_array($slot0, $taken)) {
        $slots[$i] = $slot0;
      } elseif (!in_array($slot1, $taken)) {
        $slots[$i] = $slot1;
      }
    }

    return $slots;
  }

  public function getFreeArtefactSlot()
  {
    $taken = $this->getArtefacts()
      ->map(function ($card) {
        return $card->getLocation();
      })
      ->toArray();

    for ($i = 0; $i < 5; $i++) {
      $slot = "artefact-$i";
      if (!in_array($slot, $taken)) {
        return $slot;
      }
    }

    return null;
  }

  public function getIcons()
  {
    $pastIcons = $this->countIcons();
    $timelineIcons = $this->countIconsInTimeline();
    $pastIcons['city-timeline'] = $timelineIcons[CITY];
    $pastIcons['pyramid-timeline'] = $timelineIcons[PYRAMID];
    $pastIcons['megalith-timeline'] = $timelineIcons[MEGALITH];
    return $pastIcons;
  }

  public function countIcon($icon)
  {
    $icons = $this->countIcons();
    return $icons[$icon] ?? 0;
  }

  public function countIcons($toKeep = null)
  {
    $icons = [CITY => 0, MEGALITH => 0, PYRAMID => 0, ARTEFACT => $this->getArtefacts()->count()];
    foreach ($this->getPast() as $card) {
      $icons[$card->getType()]++;
    }
    if (!is_null($toKeep)) {
      foreach (array_keys($icons) as $type) {
        if (!in_array($type, $toKeep)) {
          unset($icons[$type]);
        }
      }
    }

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

  public function countIconInTimeline($icon)
  {
    $icons = $this->countIconsInTimeline();
    return $icons[$icon] ?? 0;
  }

  public function countIconsInTimeline($toKeep = null)
  {
    $icons = [CITY => 0, MEGALITH => 0, PYRAMID => 0];
    foreach ($this->getTimeline() as $card) {
      $icons[$card->getType()]++;
    }

    if (!is_null($toKeep)) {
      foreach (array_keys($icons) as $type) {
        if (!in_array($type, $toKeep)) {
          unset($icons[$type]);
        }
      }
    }

    return $icons;
  }
}
