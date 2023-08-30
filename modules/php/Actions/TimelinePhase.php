<?php
namespace AK\Actions;
use AK\Managers\Meeples;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class TimelinePhase extends \AK\Models\Action
{
  public function getState()
  {
    return ST_TIMELINE_PHASE;
  }

  public function isAutomatic($player = null)
  {
    return true;
  }

  public function stTimelinePhase()
  {
    $player = Players::getActive();
    $childs = [];
    $cards = $player->getTimeline()->merge($player->getArtefacts());
    foreach ($cards as $card) {
      if ($card->getActivation() == TIMELINE && method_exists($card, 'getTimelineEffect')) {
        $childs[] = [
          'action' => \ACTIVATE_CARD,
          'args' => ['cardId' => $card->getId(), 'activation' => TIMELINE],
        ];
      }
    }

    if (!empty($childs)) {
      $this->insertAsChild([
        'type' => \NODE_PARALLEL,
        'childs' => $childs,
      ]);
    } else {
      Notifications::skipTimelinePhase($player);
    }

    $this->resolveAction();
  }
}
