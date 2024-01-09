<?php
namespace AK\Cards\Pyramids;

use AK\Managers\Cards;
use AK\Core\Notifications;

class P33_Calakmul extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P33_Calakmul';
    $this->type = PYRAMID;
    $this->number = 33;
    $this->name = clienttranslate('Calakmul');
    $this->country = clienttranslate('Mexico');
    $this->text = [
      clienttranslate(
        'This mighty Mayan city was inhabited for more than a millennium, before being being abandonned and swallowed up by the jungle.'
      ),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 1;
    $this->startingSpace = 1;
    $this->discard = 2;
    $this->activation = DECLINE;
    $this->effect = [
      clienttranslate("Draw cards until you reveal 2 <CITY>. 
• add the 2 <CITY> to your hand;
• and discard the other revealed cards."),
    ];
  }

  public function getDeclineEffect()
  {
    return [
      'action' => SPECIAL_EFFECT,
      'args' => [
        'sourceId' => $this->id,
        'method' => 'drawCities',
      ],
    ];
  }

  public function drawCities()
  {
    $cards = [];
    $discardedCards = [];
    $player = $this->getPlayer();
    while (count($cards) < 2 && $player->getHand()->count() < 10) {
      $card = Cards::pickOneForLocation('deck', 'hand');

      $location = null;
      if ($card->getType() == CITY) {
        $cards[] = $card;
        $card->setPId($this->pId);
        $location = 'hand';
      } else {
        $discardedCards[] = $card;
        $location = 'discard';
      }

      Cards::move($card->getId(), $location);
    }

    Notifications::drawCards($player, $cards, $this->id);
  }
}
