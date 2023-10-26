<?php
namespace AK\Technologies;

use AK\Core\Notifications;
use AK\Core\Engine;
use AK\Managers\Players;
use AK\Managers\Cards;

class T3_HermesTrismegistus extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T3_HermesTrismegistus';
    $this->type = ANCIENT;
    $this->number = 3;
    $this->level = 1;
    $this->name = clienttranslate('Hermes Trismegistus');

    $this->activation = IMMEDIATE;
    $this->effect = [
      clienttranslate("Reveal the top 5 cards of the deck:
• each player chooses 1, going clockwise;
• take a second card, then discard any remaining cards."),
    ];
  }

  public function getImmediateEffect()
  {
    $childs = [];

    // Reveal the cards
    $childs[] = [
      'action' => SPECIAL_EFFECT,
      'args' => [
        'sourceId' => $this->id,
        'method' => 'reveal',
      ],
    ];

    // Each player pick one
    foreach (Players::getTurnOrder($this->pId) as $pId) {
      $childs[] = [
        'action' => SPECIAL_EFFECT,
        'args' => [
          'sourceId' => $this->id,
          'method' => 'chooseCardToKeep',
        ],
        'pId' => $pId,
      ];
    }

    // Owner gets an extra one
    $childs[] = [
      'action' => SPECIAL_EFFECT,
      'args' => [
        'sourceId' => $this->id,
        'method' => 'chooseCardToKeep',
        'lastSelection' => true,
      ],
      'pId' => $this->pId,
    ];

    return [
      'type' => NODE_SEQ,
      'childs' => $childs,
    ];
  }

  // Reveal first 10 cards
  public function reveal()
  {
    Cards::pickForLocation(5, 'deck', 'pending');
  }

  // Prompt player to pick one artefact
  public function getChooseCardToKeepDescription()
  {
    return clienttranslate('Choose 1 card to keep');
  }

  public function argsChooseCardToKeep()
  {
    $cards = Cards::getInLocation('pending');

    return [
      'sourceId' => $this->id,
      'description' => clienttranslate('${actplayer} must choose 1 card to keep'),
      'descriptionmyturn' => clienttranslate('${you} must choose 1 card to keep'),
      'cardIds' => $cards->getIds(),
    ];
  }

  public function actChooseCardToKeep($cardId)
  {
    $args = $this->argsChooseCardToKeep();
    if (!in_array($cardId, $args['cardIds'])) {
      throw new \BgaVisibleSystemException('Invalid cards to keep. Should not happen');
    }

    $card = Cards::getSingle($cardId);
    $card->setLocation('hand');
    $card->setPId($this->pId);

    $player = Players::get($this->ctx->getPId());
    Notifications::keep($player, $card);

    $node = Engine::getNextUnresolved();
    if ($node->getArgs()['lastSelection'] ?? false) {
      $cards = Cards::getInLocation('pending');
      Cards::move($cards->getIds(), 'discard');
    }
  }
}
