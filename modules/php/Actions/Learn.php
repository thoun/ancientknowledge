<?php
namespace AK\Actions;
use AK\Managers\Meeples;
use AK\Managers\Players;
use AK\Managers\Technologies;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class Learn extends \AK\Models\Action
{
  public function getState()
  {
    return ST_LEARN;
  }

  public function getDescription()
  {
    return clienttranslate('Learn');
  }

  public function stLearn()
  {
    $techId = $this->getCtxArg('autoplay');
    if (!is_null($techId)) {
      $this->actLearn($techId);
    }
  }

  public static function getPlayableTechsAux($player, $check = true, $isDoable = false)
  {
    $pool = Technologies::getPool();
    $techs = [];
    $boards = [1 => [], 2 => [], 3 => []];
    foreach ($pool as $tId => $tech) {
      $boards[$tech->getBoard()][] = $tId;
      if ($check && !$tech->canBePlayed($player)) {
        continue;
      }

      if ($isDoable) {
        return true;
      }
      $techs[] = $tId;
    }

    // Compute the cards that triggers a refill
    $irreversibleIds = [];
    foreach ($boards as $i => $ids) {
      if (count($ids) == 2 && Technologies::canRefillBoard($i, 2)) {
        $irreversibleIds = array_merge($irreversibleIds, $ids);
      }
    }

    return $isDoable ? false : [$techs, $irreversibleIds];
  }

  public function getPlayableTechs($player, $isDoable = false)
  {
    $techId = $this->getCtxArg('autoplay');
    if (!is_null($techId)) {
      return [[$techId], []];
    }

    $check = $this->getCtxArg('checkRequirements') ?? true;
    return self::getPlayableTechsAux($player, $check, $isDoable);
  }

  public function argsLearn()
  {
    $player = Players::getActive();
    list($techs, $irreversibleIds) = $this->getPlayableTechs($player);

    return [
      'techs' => $techs,
      'irreversibleIds' => $irreversibleIds,
    ];
  }

  public function actLearn($techId)
  {
    // Sanity checks
    self::checkAction('actLearn');
    $player = Players::getActive();
    $args = $this->argsLearn();
    $techs = $args['techs'];
    if (!in_array($techId, $techs)) {
      throw new \BgaVisibleSystemException('Invalid tech to learn. Should not happen');
    }

    // Move Tech
    $tech = Technologies::getSingle($techId);
    $board = $tech->getBoard();
    $tech->setLocation('inPlay');
    $tech->setPId($player->getId());
    Notifications::learnTech($player, $tech);

    $irreversible = $this->refillBoardIfNeeded($board);

    // Check immediate effect
    if ($tech->getActivation() == \IMMEDIATE) {
      $this->insertAsChild([
        'action' => \ACTIVATE_CARD,
        'args' => ['cardId' => $tech->getId(), 'activation' => IMMEDIATE],
      ]);
    }

    // Check listener
    $this->checkAfterListeners($player, ['tech' => $tech]);

    $this->resolveAction(['techId' => $techId], $irreversible);
  }

  public function refillBoardIfNeeded($board)
  {
    // Check if a row is almost empty
    $left = Technologies::getBoard($board);
    if ($left->count() == 1) {
      // Clear board
      $deckId = Technologies::getCorrespondingDeckId($board);
      Technologies::move($left->getIds(), "discard_$deckId");
      Notifications::clearTechBoard($board, $left);

      // Try to fill it up
      if (Technologies::canRefillBoard($board)) {
        $cards = Technologies::pickForLocation(3, "deck_$deckId", "board_$board");
        Notifications::fillUpTechBoard($board, $cards);
        return true;
      } else {
        Notifications::message(clienttranslate('Not enough cards in deck to fill up technology tile n°${board}'), [
          'board' => $board,
        ]);
        return false;
      }
    }
    return false;
  }
}
