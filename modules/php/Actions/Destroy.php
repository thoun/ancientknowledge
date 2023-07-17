<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class Destroy extends \AK\Models\Action
{
  public function getState()
  {
    return ST_DESTROY;
  }

  public function getDescription()
  {
    $card = $this->getCard();

    return [
      'log' => clienttranslate('Discard ${card_name}'),
      'args' => [
        'card_name' => $card->getName(),
        'card_id' => $card->getId(),
      ],
    ];
  }

  public function getCard()
  {
    return Cards::getSingle($this->getCtxArg('cardId'));
  }

  public function stDestroy()
  {
    $player = Players::getActive();
    $card = $this->getCard();
    $card->setLocation('discard');
    Notifications::destroyCard($player, $card);
    $this->resolveAction();
  }
}
