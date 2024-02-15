<?php

namespace AK\Technologies;

use AK\Managers\Cards;
use AK\Core\Notifications;
use AK\Core\Engine;

class T22_AncientGreek extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T22_AncientGreek';
    $this->type = WRITING;
    $this->number = 22;
    $this->level = 1;
    $this->name = clienttranslate('Ancient Greek');

    $this->activation = IMMEDIATE;
    $this->effect = [
      clienttranslate("Draw the top 10 cards of the deck:
• choose and CREATE 1 <ARTIFACT>;
• and discard the remaining cards."),
    ];
  }

  public function getImmediateEffect()
  {
    return [
      'type' => NODE_SEQ,
      'childs' => [
        [
          'action' => SPECIAL_EFFECT,
          'args' => [
            'sourceId' => $this->id,
            'method' => 'reveal',
          ],
        ],
        [
          'action' => SPECIAL_EFFECT,
          'args' => [
            'sourceId' => $this->id,
            'method' => 'pickAndDiscard',
          ],
        ],
      ],
    ];
  }

  // Reveal first 10 cards
  public function reveal()
  {
    Cards::pickForLocation(10, 'deck', 'pending');
    Engine::checkpoint();
  }

  // Prompt player to pick one artefact
  public function getPickAndDiscardDescription()
  {
    return clienttranslate('CREATE 1 <ARTIFACT> from the top 10 cards and discard the others');
  }

  public function argsPickAndDiscard()
  {
    $cards = Cards::getInLocation('pending');
    $player = $this->getPlayer();
    $hand = $player->getHand();
    $validCards = $cards
      ->filter(function ($card) use ($hand) {
        if (!$card->isArtefact()) {
          return false;
        }
        if ($card->getDiscard() > $hand->count()) {
          return false;
        }

        return true;
      })
      ->map(fn ($card) => $card->getDiscard());

    return [
      'sourceId' => $this->id,
      'description' => clienttranslate('${actplayer} must create 1 <ARTIFACT> from the top 10 cards'),
      'descriptionmyturn' => clienttranslate('${you} must create 1 <ARTIFACT> from the top 10 cards'),
      '_private' => [
        'active' => [
          'canCreate' => !is_null($player->getFreeArtefactSlot()) && count($validCards) > 0,
          'cardIds' => $cards->getIds(),
          'validCards' => $validCards,
        ],
      ],
    ];
  }

  public function actPickAndDiscard($cardId = null, $discardedCardIds = [])
  {
    $args = $this->argsPickAndDiscard()['_private']['active'];
    $flow = null;

    // No card selected => do nothing
    if (is_null($cardId)) {
      if ($args['canCreate']) {
        throw new \BgaVisibleSystemException('You must create an artefact. Should not happen');
      }
    }
    // Card selected => create it
    else {
      $needDiscard = $args['validCards'][$cardId] ?? null;
      if (is_null($needDiscard)) {
        throw new \BgaVisibleSystemException('Invalid cards to create. Should not happen');
      }
      if (count($discardedCardIds) < $needDiscard) {
        throw new \BgaVisibleSystemException('Invalid cards to discard. Should not happen');
      }

      $card = Cards::getSingle($cardId);
      $card->setLocation('hand');
      $card->setPId($this->pId);

      $player = $this->getPlayer();
      $cards = Cards::getInLocation('pending');
      Notifications::keepAndDiscard($player, $card, $cards);

      $flow = [
        'action' => CREATE,
        'args' => ['autoplayArtefact' => $cardId, 'autoplayDiscard' => $discardedCardIds],
      ];
    }

    $cards = Cards::getInLocation('pending');
    Cards::move($cards->getIds(), 'discard');
    return $flow;
  }
}
