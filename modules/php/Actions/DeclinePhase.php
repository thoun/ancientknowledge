<?php
namespace AK\Actions;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
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

    // The two first slot of the timeline
    $spaces = [[1, 0], [1, 1]];
    $childs = [];
    foreach ($spaces as $space) {
      $card = $player->getCardOnTimelineSpace($space);
      if (!is_null($card)) {
        $childs[] = [
          'action' => DECLINE,
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
      'action' => 'TODO', // Slide card left
    ]);

    $this->resolveAction();
  }
}
