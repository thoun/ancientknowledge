<?php
namespace AK\Technologies;

use AK\Managers\Technologies;
use AK\Actions\Learn;

class T27_LatinAlphabet extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T27_LatinAlphabet';
    $this->type = WRITING;
    $this->number = 27;
    $this->level = 1;
    $this->name = clienttranslate('Latin Alphabet');
    $this->requirement = [clienttranslate('5 monuments in your Past.')];

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Choose 1 Technology [II], and put it on the bottom of the corresponding deck.')];
    $this->implemented = true;
  }

  public function canBePlayed($player)
  {
    return array_sum($player->countIcons(BUILDINGS)) >= 5;
  }

  public function getImmediateEffect()
  {
    return [
      'action' => SPECIAL_EFFECT,
      'args' => [
        'sourceId' => $this->id,
        'method' => 'chooseTech',
      ],
    ];
  }

  public function getChooseTechDescription()
  {
    return clienttranslate('Put 1 Technology [II] at the bottom of the deck');
  }

  public function argsChooseTech()
  {
    $techs = Technologies::getPool()->filter(fn($tech) => $tech->getLevel() == 2);

    return [
      'sourceId' => $this->id,
      'description' => clienttranslate('${actplayer} must choose 1 Technology [II] to be placed at the bottom of the deck'),
      'descriptionmyturn' => clienttranslate('You must choose 1 Technology [II] to be placed at the bottom of the deck'),
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
    Technologies::insertAtBottom($techId, 'deck_2');
    Learn::refillBoardIfNeeded($board);

    Notifications::placeAtDeckBottom($player, $tech, 2);
  }
}
