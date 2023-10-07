<?php
namespace AK\Technologies;

use AK\Managers\Cards;
use AK\Core\Notifications;

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

    return [
      'sourceId' => $this->id,
      'description' => clienttranslate('${actplayer} must create 1 <ARTIFACT> from the top 10 cards'),
      'descriptionmyturn' => clienttranslate('${you} must create 1 <ARTIFACT> from the top 10 cards'),
      '_private' => [
        'active' => [
          'canCreate' => !is_null($player->getFreeArtefactSlot()),
          'cardIds' => $cards->getIds(),
          'validCardIds' => $cards->filter(fn($card) => $card->isArtefact())->getIds(),
        ],
      ],
    ];
  }

  public function actPickAndDiscard($cardId = null)
  {
    $args = $this->argsPickAndDiscard()['_private']['active'];
    $flow = null;

    // No card selected => do nothing
    if (is_null($cardId)) {
      if (!empty($args['validCardIds']) && $args['canCreate']) {
        throw new \BgaVisibleSystemException('You must create an artefact. Should not happen');
      }
    }
    // Card selected => create it
    else {
      if (!in_array($cardId, $args['validCardIds'])) {
        throw new \BgaVisibleSystemException('Invalid cards to create. Should not happen');
      }

      $card = Cards::getSingle($cardId);
      $card->setLocation('hand');
      $card->setPId($this->pId);

      $player = $this->getPlayer();
      $cards = Cards::getInLocation('pending');
      Notifications::keepAndDiscard($player, $card, $cards);

      $flow = [
        'action' => CREATE,
        'args' => ['autoplayArtefact' => $cardId],
      ];
    }

    $cards = Cards::getInLocation('pending');
    Cards::move($cards->getIds(), 'discard');
    return $flow;
  }
}
