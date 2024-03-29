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
      if (
        Players::get($pId)
          ->getHand()
          ->count() == 10
      ) {
        continue;
      }

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
    Engine::checkpoint();
  }

  // Prompt player to pick one artefact
  public function getChooseCardToKeepDescription()
  {
    return clienttranslate('Choose 1 card to keep');
  }

  public function argsChooseCardToKeep()
  {
    $cards = Cards::getInLocation('pending');
    $player = Players::getActive();

    return [
      'canSkip' => $player->getHand()->count() == 10,
      'sourceId' => $this->id,
      'description' => clienttranslate('${actplayer} must choose 1 card to keep'),
      'descriptionmyturn' => clienttranslate('${you} must choose 1 card to keep'),
      'cardIds' => $cards->getIds(),
    ];
  }

  public function stChooseCardToKeep()
  {
    $args = $this->argsChooseCardToKeep();
    if ($args['canSkip']) {
      $this->actPassChooseCardToKeep();
      $node = Engine::getNextUnresolved();
      Engine::resolveAction([], false, $node);
      Engine::proceed();
    }
  }

  public function actPassChooseCardToKeep()
  {
    $args = $this->argsChooseCardToKeep();
    if (!$args['canSkip']) {
      throw new \BgaVisibleSystemException('You cant skip unless you have 10 cards in hand. Should not happen');
    }

    $player = Players::getActive();
    Notifications::cantKeep($player);

    $node = Engine::getNextUnresolved();
    if ($node->getArgs()['lastSelection'] ?? false) {
      $cards = Cards::getInLocation('pending');
      Cards::move($cards->getIds(), 'discard');
    }
  }

  public function actChooseCardToKeep($cardId = null)
  {
    if (is_null($cardId)) {
      $this->actPassChooseCardToKeep();
      return;
    }

    $args = $this->argsChooseCardToKeep();
    if (!in_array($cardId, $args['cardIds'])) {
      throw new \BgaVisibleSystemException('Invalid cards to keep. Should not happen');
    }

    $node = Engine::getNextUnresolved();
    $pId = $node->getPId();
    $card = Cards::getSingle($cardId);
    $card->setLocation('hand');
    $card->setPId($pId);

    $player = Players::get($pId);
    Notifications::keep($player, $card);

    if ($node->getArgs()['lastSelection'] ?? false) {
      $cards = Cards::getInLocation('pending');
      Cards::move($cards->getIds(), 'discard');
    }
  }
}
