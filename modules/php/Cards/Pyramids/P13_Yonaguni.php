<?php
namespace AK\Cards\Pyramids;

use AK\Core\Notifications;
use AK\Managers\Cards;

class P13_Yonaguni extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P13_Yonaguni';
    $this->type = PYRAMID;
    $this->number = 13;
    $this->name = clienttranslate('Yonaguni');
    $this->country = clienttranslate('Japan');
    $this->text = [clienttranslate('Gigantic underwater pyramid or natural formation?')];

    $this->victoryPoint = 8;
    $this->initialKnowledge = 14;
    $this->startingSpace = 4;
    $this->activation = IMMEDIATE;
    $this->effect = [
      clienttranslate(
        'You may discard as many <ARTIFACT> from your board as you wish. Discard 4 <KNOWLEDGE> from this monument for each <ARTIFACT> you discard.'
      ),
    ];
    $this->implemented = true;
  }

  public function getImmediateEffect()
  {
    return [
      'action' => SPECIAL_EFFECT,
      'args' => [
        'sourceId' => $this->id,
        'method' => 'discardAndRemoveKnowledge',
      ],
    ];
  }

  public function getDiscardAndRemoveKnowledgeDescription()
  {
    return clienttranslate('Discard <ARTIFACT> to remove <KNOWLEDGE>');
  }

  public function argsDiscardAndRemoveKnowledge()
  {
    $player = $this->getPlayer();
    $cards = $player->getArtefacts();

    return [
      'sourceId' => $this->id,
      'description' => clienttranslate('${actplayer} may discard as many <ARTIFACT> from their board as they wish'),
      'descriptionmyturn' => clienttranslate('${you} may discard as many <ARTIFACT> from their board as you wish'),
      'cardIds' => $cards->getIds(),
    ];
  }

  public function actDiscardAndRemoveKnowledge($cardIds)
  {
    $player = $this->getPlayer();
    $args = $this->argsDiscardAndRemoveKnowledge();
    if (!empty(array_diff($cardIds, $args['cardIds']))) {
      throw new \BgaVisibleSystemException('Invalid cards to discard. Should not happen');
    }

    if (!empty($cardIds)) {
      // Discard cards
      $cards = Cards::getMany($cardIds);
      Cards::discard($cardIds);
      Notifications::discardCards($player, $cards, null, null, ['fromBoard' => true]);

      return [
        'action' => REMOVE_KNOWLEDGE,
        'args' => [
          'n' => 4 * count($cardIds),
          'cardIds' => [$this->id],
        ],
      ];
    }
  }
}
