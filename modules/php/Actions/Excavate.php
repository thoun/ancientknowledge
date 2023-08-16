<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class Excavate extends \AK\Models\Action
{
  public function getState()
  {
    return ST_EXCAVATE;
  }

  public function getDescription()
  {
    return clienttranslate('Excavate');
  }

  public function argsExcavate()
  {
    $player = Players::getActive();
    return [
      'cardIds' => $player
        ->getPast()
        ->filter(function ($card) {
          return !$card->isRotated();
        })
        ->getIds(),
    ];
  }

  public function actExcavate($cardIds)
  {
    // Sanity checks
    self::checkAction('actExcavate');
    $player = Players::getActive();
    if (!empty(array_diff($cardIds, $this->argsExcavate()['cardIds']))) {
      throw new \BgaVisibleSystemException('Invalid cards to rotate. Should not happen');
    }

    // Rotate cards
    $cards = Cards::getMany($cardIds);
    Cards::rotate($cardIds);
    Notifications::rotateCards($player, $cards);

    $mult = $player->hasEffect('A29_PhaistosDisc') ? 3 : 2;

    if ($player->hasEffect('A25_KensingtonRunestone') && count($cardIds) == 2) {
      $this->insertAsChild([
        'type' => NODE_XOR,
        'childs' => [
          [
            'action' => REMOVE_KNOWLEDGE,
            'args' => ['n' => 6],
          ],
          [
            'action' => DRAW,
            'args' => ['n' => $mult * count($cardIds)],
          ],
        ],
      ]);
    } else {
      $this->insertAsChild([
        'action' => DRAW,
        'args' => ['n' => $mult * count($cardIds)],
      ]);
    }

    // Check listener
    $this->checkAfterListeners($player, ['n' => count($cardIds)]);

    $this->resolveAction(['cardIds' => $cardIds]);
  }
}
