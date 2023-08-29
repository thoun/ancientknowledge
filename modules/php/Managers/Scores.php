<?php
namespace AK\Managers;
use AK\Core\Globals;
use AK\Core\Stats;
use AK\Core\Notifications;
use AK\Managers\PlayerCards;

/*
 * Scores manager : allows to easily update/notify scores
 *   -> could have been inside Players.php but better structure this way
 */
class Scores
{
  /*
   * Update scores UI
   */
  protected static $scores = [];
  protected static function init()
  {
    self::$scores = [];
    foreach (Players::getAll() as $pId => $player) {
      self::$scores[$pId] = [
        'total' => 0,
      ];
      foreach (SCORING_CATEGORIES as $category) {
        self::$scores[$pId][$category] = [
          'total' => 0,
          'entries' => [],
        ];
      }
    }
  }

  /**
   * Add a scoring entry in the corresponding category
   */
  public static function addEntry($player, $category, $score, $sourceId = null)
  {
    $pId = is_int($player) ? $player : $player->getId();
    if (!is_null($sourceId)) {
      self::$scores[$pId][$category]['entries'][$sourceId] = $score;
    }
    self::$scores[$pId][$category]['total'] += $score;
    self::$scores[$pId]['total'] += $score;
  }

  /**
   * Update every player score in DB and on UI
   */
  public function update($notif = false)
  {
    if (!Globals::isLiveScoring()) {
      return;
    }

    $scores = self::compute($notif);
    foreach (Players::getAll() as $pId => $player) {
      $score = self::$scores[$pId]['total'];
      $player->setScore($score);
      if ($notif) {
        Notifications::scoringEntry($player, SCORING_TOTAL, $score);
      }
    }

    Notifications::updateScores(self::$scores);
  }

  /**
   * Compute the scores and return them
   */
  public function compute($notif = false)
  {
    self::init();

    //////////////////////
    // PAST
    //////////////////////
    foreach (Players::getAll() as $pId => $player) {
      foreach ($player->getPast() as $card) {
        $vp = $card->getVictoryPoint();
        self::addEntry($player, SCORING_BUILDINGS, $vp, $card->getId());
      }

      $score = self::$scores[$pId][SCORING_BUILDINGS]['total'];
      // Stats::setScorePast($player, $score);
      if ($notif) {
        Notifications::scoringEntry($player, SCORING_BUILDINGS, $score);
      }
    }

    //////////////////////
    // EFFECTS
    //////////////////////
    foreach (Players::getAll() as $pId => $player) {
      foreach ($player->getPast() as $card) {
        if ($card->getActivation() == ENDGAME) {
          self::addEntry($player, SCORING_EFFECTS, $card->getScore(), $card->getId());
        }
      }

      $score = self::$scores[$pId][SCORING_EFFECTS]['total'];
      // Stats::setScoreCards($player, $score);
      if ($notif) {
        Notifications::scoringEntry($player, SCORING_EFFECTS, $score);
      }
    }

    //////////////////////
    // TECHNOLOGIES
    //////////////////////
    foreach (Players::getAll() as $pId => $player) {
      foreach ($player->getTechTiles() as $tech) {
        if ($tech->getActivation() == ENDGAME) {
          self::addEntry($player, SCORING_TECHS, $tech->getScore(), $tech->getId());
        }
      }

      $score = self::$scores[$pId][SCORING_TECHS]['total'];
      // Stats::setScoreTechnologies($player, $score);
      if ($notif) {
        Notifications::scoringEntry($player, SCORING_TECHS, $score);
      }
    }

    //////////////////////
    // TIMELINE
    //////////////////////
    foreach (Players::getAll() as $pId => $player) {
      $score = $player->getTimeline()->count();
      self::addEntry($player, SCORING_TIMELINE, $score);

      // Stats::setScoreTimeline($player, $score);
      if ($notif) {
        Notifications::scoringEntry($player, SCORING_TIMELINE, $score);
      }
    }

    //////////////////////
    // LOST KNOWLEDGE
    //////////////////////
    foreach (Players::getAll() as $pId => $player) {
      $score = -$player->getLostKnowledge();
      self::addEntry($player, SCORING_LOST_KNOWNLEDGE, $score);

      // Stats::setLostKnowledge($player, $score);
      if ($notif) {
        Notifications::scoringEntry($player, SCORING_LOST_KNOWNLEDGE, $score);
      }

      // Also aux score
      $player->setScoreAux($score);
    }

    return self::$scores;
  }
}
