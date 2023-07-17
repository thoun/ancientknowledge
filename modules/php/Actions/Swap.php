<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class Swap extends \AK\Models\Action
{
  public function getState()
  {
    return ST_SWAP;
  }

  public function getDescription()
  {
    $cardId = $this->getCardId();

    return is_null($cardId)
      ? clienttranslate('Swap two buildings in your timeline')
      : [
        'log' => clienttranslate('Swap ${card_name} with another building in your timeline'),
        'args' => [
          'card_name' => Cards::getSingle($cardId)->getName(),
          'card_id' => $cardId,
        ],
      ];
  }

  public function getCardId()
  {
    return $this->getCtxArg('cardId');
  }

  public function argsSwap()
  {
    $player = Players::getActive();
    $cardId = $this->getCardId();
    return [
      'cardIds' => $player->getTimeline()->getIds(),
      'descSuffix' => is_null($cardId) ? '' : 'fixed',
      'card_id' => $cardId,
      'card_name' => is_null($cardId) ? '' : Cards::getSingle($cardId)->getName(),
    ];
  }

  public function actSwap($cardId1, $cardId2)
  {
    // Sanity checks
    self::checkAction('actSwap');
    $player = Players::getActive();
    $args = $this->argsSwap();
    if (!in_array($cardId1, $args['cardIds']) || !in_array($cardId2, $args['cardIds'])) {
      throw new \BgaVisibleSystemException('Invalid cards. Should not happen');
    }
    if ($cardId1 == $cardId2) {
      throw new \BgaVisibleSystemException('You cant swap a card with itself. Should not happen');
    }
    if (!is_null($args['card_id']) && $cardId1 != $args['card_id']) {
      throw new \BgaVisibleSystemException('You must swap the forced card. Should not happen');
    }

    // Swap them
    $card1 = Cards::get($cardId1);
    $loc1 = $card1->getLocation();
    $card2 = Cards::get($cardId2);
    $loc2 = $card2->getLocation();
    $card1->setLocation($loc2);
    $card2->setLocation($loc1);
    Notifications::swapCards($player, $card1, $card2, $this->getSource());

    $this->resolveAction();
  }

  public function actPass()
  {
    $this->resolveAction();
  }
}
