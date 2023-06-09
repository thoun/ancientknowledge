<?php
namespace AK\Actions;
use AK\Managers\Meeples;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Managers\ActionCards;
use AK\Core\Engine;
use AK\Core\Globals;
use AK\Core\Stats;
use AK\Helpers\Utils;

class ChooseAction extends \AK\Models\Action
{
  public function getState()
  {
    return ST_CHOOSE_ACTION;
  }

  public function getDescription()
  {
    return clienttranslate('Choose an action');
  }

  public function argsChooseActionCard()
  {
    $player = Players::getActive();
    return [];
  }

  public function actChooseAction($action)
  {
    self::checkAction('actChooseAction');

    // // Insert cleanup actionName
    // $this->insertAsChild([
    //   'action' => \CLEANUP,
    //   'pId' => $player->getId(),
    //   'args' => ['card' => $cardId, 'hypnosis' => $isHypnosis],
    // ]);
    // $this->resolveAction(['card' => $cardId, 'strength' => $strength]);
  }
}
