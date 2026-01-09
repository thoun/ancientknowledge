<?php
namespace AK;
use AK\Managers\Players;
use AK\Managers\Meeples;
use AK\Managers\Cards;
use AK\Managers\Scores;
use AK\Core\Globals;
use AK\Core\Engine;
use AK\Core\Game;
use AK\Core\Notifications;
use AK\Helpers\Utils;
use AK\Helpers\Log;
use AK\Helpers\Collection;

trait DebugTrait
{
  function triggerEnd()
  {
    Globals::setEndOfGameTriggered(true);
    Notifications::endOfGameTriggered(Players::getCurrent());
  }

  function scores()
  {
    Scores::compute(true);
  }

  function tp()
  {
    // $this->actTakeAtomicAction('actDiscardMulti', [['P10_Teotihuacan', 'P14_TikalTempleI']]);
    // $this->actTakeAtomicAction('actDrawAndKeep', ['A28_DogUFigurines']);
    $this->actTakeAtomicAction('actFlipTechTile', [1]);
  }

  // addCardsToPast(6)
  function addCardsToPast($n = 1)
  {
    for ($i = 0; $i < $n; ) {
      $card = Cards::getTopOf('deck', 1)->first();
      if ($card->getType() == ARTEFACT) {
        Cards::insertOnTop($card->getId(), 'hand');
      } else {
        self::addPast($card->getId());
        $i++;
      }
    }
  }

  // addHand(M15_BarabarCaves)
  // addHand(P8_PyramidOfUserkaf)
  // addHand(P35_CandiKethek)
  // addHand(M6_DolmenOfGanghwa)
  // addHand(M8_DolmenOfGochang)
  function addHand($cardId)
  {
    $player = Players::getCurrent();
    $card = Cards::get($cardId);
    Cards::insertOnTop($cardId, 'hand');
    $card->setPId($player->getId());
    Notifications::drawCards($player, [$card], null);
    Engine::proceed();
  }

  // addTech(T22_AncientGreek)
  function addTech($techId)
  {
    self::DbQuery("UPDATE `technologies` SET `technology_location`='deck_1' WHERE `technology_location`='board_1'");
    self::DbQuery("UPDATE `technologies` SET `technology_location`='board_1' WHERE `technology_id`='$techId'");
  }

  // addPast(P10_Teotihuacan)
  function addPast($cardId)
  {
    $player = Players::getCurrent();
    $pId = $player->getId();
    $card = Cards::get($cardId);
    Cards::insertOnTop($cardId, 'past');
    $card->setPId($player->getId());
    Notifications::declineCard($player, $card, 0);
    Engine::proceed();
  }

  function engDisplay()
  {
    var_dump(Globals::getEngine());
  }

  function engProceed()
  {
    Engine::proceed();
  }
}
