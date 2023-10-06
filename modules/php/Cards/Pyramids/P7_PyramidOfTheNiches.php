<?php
namespace AK\Cards\Pyramids;

use AK\Managers\Technologies;

class P7_PyramidOfTheNiches extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P7_PyramidOfTheNiches';
    $this->type = PYRAMID;
    $this->number = 7;
    $this->name = clienttranslate('Pyramid Of The Niches');
    $this->country = clienttranslate('Mexico');
    $this->text = [
      clienttranslate('At 18 meters high, this pyramid covers an earlier construction that had similar architecture.'),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 3;
    $this->activation = DECLINE;
    $this->effect = [
      clienttranslate("Secretly look at the top 7 Technology [II] cards of the deck:
• LEARN 1 if you fulfill its requirements;
• and put the remaining cards on the bottom of the deck, in any order."),
    ];
    $this->implemented = true;
  }

  public function getDeclineEffect()
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
            'method' => 'ChooseTechAndScrapOthers',
          ],
        ],
      ],
    ];
  }

  // Reveal first 7 cards of tech [II]
  public function reveal()
  {
    Technologies::pickForLocation(7, 'deck_2', 'pending');
  }

  public function getChooseTechAndScrapOthersDescription()
  {
    return clienttranslate('Learn 1 Technology from top Technology [II] cards');
  }

  public function argsChooseTech()
  {
    $player = $this->getPlayer();
    $allTechs = Technologies::getInLocation('pending');
    $learnableTechs = $allTechs->filter(fn($tech) => $tech->canBePlayed($player));

    return [
      'sourceId' => $this->id,
      'description' => clienttranslate(
        '${actplayer} must choose 1 Technology [II] to Learn and how to replace the others in the deck'
      ),
      'descriptionmyturn' => clienttranslate(
        '${you} must choose 1 Technology [II] to Learn and how to replace the others in the deck'
      ),
      '_private' => [
        'active' => [
          'techIds' => $allTechs->getIds(),
          'learnableTechIds' => $learnableTechs->getIds(),
        ],
      ],
    ];
  }

  public function actChooseTechAndScrapOthers($techId, $otherIds)
  {
    $args = $this->argsChooseTech()['_private']['active'];
    if (!is_null($techId) && !in_array($techId, $args['learnableTechIds'])) {
      throw new \BgaVisibleSystemException('Invalid tech to select. Should not happen');
    }
    if (is_null($techId) && !empty($args['learnableTechIds'])) {
      throw new \BgaVisibleSystemException('You must learn a tech. Should not happen');
    }
    if (!empty(array_diff($otherIds, $args['techIds']))) {
      throw new \BgaVisibleSystemException('Invalid techs to discard. Should not happen');
    }

    foreach ($otherIds as $tId) {
      $tech = Technologies::getSingle($tId);
      $board = $tech->getBoard();
      $level = $tech->getId();
      Technologies::insertAtBottom($tId, "deck_$level");
    }

    if (!is_null($techId)) {
      return [
        'action' => LEARN,
        'args' => ['autoplay' => $techId],
      ];
    }
  }
}
