<?php

namespace AK\Cards\Megaliths;

use AK\Managers\Players;
use AK\Managers\Cards;
use AK\Core\Notifications;
use AK\Core\Engine;

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
  }

  public function getDeclineEffect()
  {
    return [
      'action' => SPECIAL_EFFECT,
      'args' => [
        'sourceId' => $this->id,
        'method' => 'chooseOpponent',
      ],
    ];
  }

  // Prompt player to choose one opponent
  public function getChooseOpponentDescription()
  {
    return clienttranslate('Steal 1 card from oppononents\' hand');
  }

  function stChooseOpponent()
  {
    $player = $this->getPlayer();

    // Already too much cards ? Can't steal
    if ($player->getHand()->count() >= 10) {
      Notifications::message(\clienttranslate('${player_name} already has 10 cards in hand and thus can\'t steal a card'), [
        'player' => $player,
      ]);
      return true; // AUTO RESOLVE
    }

    // Do we have a valid opponent ?
    $pIds = [];
    foreach (Players::getAll() as $pId => $player2) {
      if ($pId != $this->pId && $player2->getHand()->count() > 0) {
        $pIds[] = $pId;
      }
    }
    if (empty($pIds)) {
      Notifications::message(\clienttranslate('${player_name} can\'t steal a card because opponents have none'), [
        'player' => $player,
      ]);
      return true; // AUTO RESOLVE
    }
  }

  public function argsChooseOpponent()
  {
    $pIds = [];
    foreach (Players::getAll() as $pId => $player) {
      if ($pId != $this->pId && $player->getHand()->count() > 0) {
        $pIds[] = $pId;
      }
    }

    return [
      'sourceId' => $this->id,
      'description' => clienttranslate('${actplayer} must choose an opponent to steal a card from their hand'),
      'descriptionmyturn' => clienttranslate('${you} must choose an opponent to steal a card from their hand'),
      'pIds' => $pIds,
    ];
  }

  public function actChooseOpponent($pId)
  {
    $args = $this->argsChooseOpponent();
    if (!in_array($pId, $args['pIds'])) {
      throw new \BgaVisibleSystemException('Invalid player to steal. Should not happen');
    }
    $target = Players::get($pId);
    $player = $this->getPlayer();
    Notifications::message(clienttranslate('${player_name} is going to steal from ${player_name2}'), [
      'player' => $player,
      'player2' => $target,
    ]);
    Engine::checkpoint();

    return [
      'action' => SPECIAL_EFFECT,
      'args' => [
        'sourceId' => $this->id,
        'method' => 'stealCard',
        'args' => [$pId],
      ],
    ];
  }

  // Prompt player to pick one card
  public function argsStealCard($pId)
  {
    $player = Players::get($pId);
    $cardIds = $player->getHand()->getIds();

    return [
      'sourceId' => $this->id,
      'description' => clienttranslate('${actplayer} must choose 1 card to steal'),
      'descriptionmyturn' => clienttranslate('${you} must choose 1 card to steal'),
      '_private' => [
        'active' => [
          'cardIds' => $cardIds,
        ],
      ],
    ];
  }

  public function actStealCard($cardId, $targetId)
  {
    $args = $this->argsStealCard($targetId)['_private']['active'];
    if (!in_array($cardId, $args['cardIds'])) {
      throw new \BgaVisibleSystemException('Invalid card to steal. Should not happen');
    }
    $target = Players::get($targetId);

    $card = Cards::getSingle($cardId);
    $card->setPId($this->pId);
    $player = $this->getPlayer();
    Notifications::steal($player, $target, $card);
  }
}
