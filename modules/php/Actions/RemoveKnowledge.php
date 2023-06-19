<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class RemoveKnowledge extends \AK\Models\Action
{
  public function getState()
  {
    return ST_REMOVE_KNOWLEDGE;
  }

  public function getDescription()
  {
    return [
      'log' => clienttranslate('Remove ${n} <KNOWLEDGE> on your timeline'),
      'args' => [
        'n' => $this->getN(),
      ],
    ];
  }

  public function getN()
  {
    return $this->getCtxArg('n') ?? 1;
  }

  public function argsRemoveKnowledge()
  {
    $player = Players::getActive();
    return [
      'n' => $this->getN(),
    ];
  }

  public function actRemoveKnowledge()
  {
    // Sanity checks
    self::checkAction('actRemoveKnowledge');
    // $player = Players::getActive();
    // $cards = $this->argsExcavate()['cards'];
    // if (!empty(array_diff($cardIds, $cards))) {
    //   throw new \BgaVisibleSystemException('Invalid cards to rotate. Should not happen');
    // }

    // // Rotate cards
    // $cards = Cards::get($cardIds);
    // Cards::rotate($cardIds);
    // Notifications::rotateCards($player, $cards);

    // $this->insertAsChild([
    //   'action' => DRAW,
    //   'args' => ['n' => 2 * count($cardIds)],
    // ]);

    // $this->resolveAction(['cardId' => $cardId, 'slot' => $slot]);
  }
}
