<?php
namespace AK\Cards\Pyramids;

use AK\Core\Notifications;
use AK\Managers\Players;
use AK\Managers\Technologies;
use AK\Actions\Learn;

class P35_CandiKethek extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P35_CandiKethek';
    $this->type = PYRAMID;
    $this->number = 35;
    $this->name = clienttranslate('Candi Kethek');
    $this->country = clienttranslate('Indonesia');
    $this->text = [clienttranslate('The temple has 7 west-facing terraces.')];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 2;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Choose 2 available Technologies and put them on the bottom of their respective deck(s).')];
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
            'method' => 'chooseTech',
          ],
        ],
        [
          'action' => SPECIAL_EFFECT,
          'args' => [
            'sourceId' => $this->id,
            'method' => 'chooseTech',
          ],
        ],
      ],
    ];
  }

  public function getChooseTechDescription()
  {
    return clienttranslate('Put 1 Technology at the bottom of the corresponding deck');
  }

  public function argsChooseTech()
  {
    $techs = Technologies::getPool();

    return [
      'sourceId' => $this->id,
      'description' => clienttranslate('${actplayer} must choose 1 Technology to be placed at the bottom of the deck'),
      'descriptionmyturn' => clienttranslate('${you} must choose 1 Technology to be placed at the bottom of the deck'),
      '_private' => [
        'active' => [
          'techIds' => $techs->getIds(),
        ],
      ],
    ];
  }

  public function actChooseTech($techId = null)
  {
    $args = $this->argsChooseTech()['_private']['active'];
    if (!in_array($techId, $args['techIds'])) {
      throw new \BgaVisibleSystemException('Invalid tech to select. Should not happen');
    }

    $tech = Technologies::getSingle($techId);
    $board = $tech->getBoard();
    $level = $tech->getLevel();
    Technologies::insertAtBottom($techId, "deck_$level");
    Learn::refillBoardIfNeeded($board);

    $player = Players::getActive();
    Notifications::placeAtDeckBottom($player, $tech, $level);
  }
}
