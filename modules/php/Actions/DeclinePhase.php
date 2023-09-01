<?php
namespace AK\Actions;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Core\Globals;
use AK\Helpers\Utils;

class DeclinePhase extends \AK\Models\Action
{
  public function getState()
  {
    return ST_DECLINE_PHASE;
  }

  public function isAutomatic($player = null)
  {
    return true;
  }

  public function stDeclinePhase()
  {
    $player = Players::getActive();

    // PotatoPalace: skip decline
    if (Globals::isSkipDecline()) {
      Globals::setSkipDecline(false);
      Notifications::skipDeclinePhase($player);
      $this->resolveAction();
      return;
    }
    Globals::setDeclinePhase(true);
    Globals::setDeclinedKnowledge(0);

    // The two first slot of the timeline
    $spaces = [[1, 0], [1, 1]];
    $childs = [];
    foreach ($spaces as $space) {
      $card = $player->getCardOnTimelineSpace($space);
      if (!is_null($card)) {
        $childs[] = [
          'action' => DECLINE_CARD,
          'args' => ['cardId' => $card->getId()],
        ];
      }
    }

    if (!empty($childs)) {
      $this->insertAsChild([
        'type' => \NODE_PARALLEL,
        'childs' => $childs,
      ]);

      $cardsInThePast = $player->getPast()->count() + count($childs);
      if ($cardsInThePast > 7 && Globals::isFirstHalf()) {
        $this->insertAsChild([
          'action' => 'TODO', // Flip techs
        ]);
      } elseif ($cardsInThePast > 14) {
        Globals::setEndOfGameTriggered(true);
      }
    }

    $this->insertAsChild([
      'action' => \DECLINE_PHASE,
      'args' => ['method' => 'stDeclineSlideLeft'],
    ]);

    $this->resolveAction();
  }

  public function stDeclineSlideLeft()
  {
    $player = Players::getActive();

    // A32_ElongatedSkulls
    if ($player->hasEffect('A32_ElongatedSkulls')) {
      $n = 2 * intdiv(Globals::getDeclinedKnowledge(), 3);
      if ($n > 0) {
        $this->insertAsChild([
          'action' => DRAW,
          'args' => ['n' => $n],
        ]);
      }
    }

    $n = 0;
    foreach ($player->getTimeline() as $card) {
      $n++;
      $spot = $card->getTimelineSpace();
      $spot[0]--;
      $card->setLocation("timeline-$spot[0]-$spot[1]");
    }

    if ($n > 0) {
      Notifications::declineSlideLeft($player, $n);
    }
    Globals::setDeclinePhase(false);
    $this->resolveAction();
  }
}
