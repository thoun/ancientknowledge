<?php
namespace AK\Cards\Megaliths;

use AK\Managers\Players;
use AK\Managers\Cards;
use AK\Core\Notifications;

class M14_MenhirOfKerloas extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M14_MenhirOfKerloas';
    $this->type = MEGALITH;
    $this->number = 14;
    $this->name = clienttranslate('Menhir Of Kerloas');
    $this->country = clienttranslate('France');
    $this->text = [clienttranslate('It is considered the tallest menhir currently standing at 9.50 meters above ground.')];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 3;
    $this->lockedSpace = true;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('Look at one of your opponents\' hands and take 1 card of your choice from them.')];
    $this->implemented = true;
  }

  public function getDeclineEffect()
  {
    return [
      'action' => SPECIAL_EFFECT,
      'args' => [
        'sourceId' => $this->id,
        'method' => 'stealCard',
      ],
    ];
  }

  // Prompt player to pick one artefact
  public function getStealCardDescription()
  {
    return clienttranslate('Steal 1 card from oppononents\' hand');
  }

  public function argsStealCard()
  {
    $cardIds = [];
    foreach (Players::getAll() as $pId => $player) {
      if ($pId != $this->pId) {
        $cardIds[$pId] = $player->getHand()->getIds();
      }
    }

    return [
      'sourceId' => $this->id,
      'description' => clienttranslate('${actplayer} must choose 1 card to steal'),
      'descriptionmyturn' => clienttranslate('${you} must choose 1 card to steal'),
      'cardIds' => $cardIds,
    ];
  }

  public function actStealCard($cardId)
  {
    $args = $this->argsStealCard();
    $targetId = null;
    foreach ($args['cardIds'] as $pId => $cardIds) {
      if (in_array($cardId, $cardIds)) {
        $targetId = $pId;
      }
    }
    if (is_null($targetId)) {
      throw new \BgaVisibleSystemException('Invalid card to steal. Should not happen');
    }
    $target = Players::get($targetId);

    $card = Cards::getSingle($cardId);
    $card->setPId($this->pId);
    $player = $this->getPlayer();
    Notifications::steal($player, $target, $card);
  }
}
