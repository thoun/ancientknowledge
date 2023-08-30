<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Managers\Technologies;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Core\Globals;
use AK\Helpers\Utils;

class FlipTechTile extends \AK\Models\Action
{
  public function getState()
  {
    return ST_FLIP_TECH_TILE;
  }

  public function getDescription()
  {
    return clienttranslate('Flip a tech tile (mid game reached)');
  }

  public function argsFlipTechTile()
  {
    return [];
  }

  public function actFlipTechTile($board)
  {
    if (!in_array($board, [1, 2])) {
      throw new \BgaVisibleSystemException('Invalid tile to flip. Should not happen');
    }

    $player = Players::getActive();

    // Empty board and fill it with lvl 2 cards
    $discarded = Technologies::getBoard($board);
    Technologies::move($discarded->getIds(), 'discard_1');
    Notifications::midGameReached($player, $discarded, $board);
    Globals::setFirstHalf(false);
    Globals::setSecondLvl2TechTile($board);

    // Try to fill it up
    if (Technologies::canRefillBoard($board)) {
      $cards = Technologies::pickForLocation(3, 'deck_2', "board_$board");
      Notifications::fillUpTechBoard($board, $cards);
    }

    $this->resolveAction([], true);
  }
}
