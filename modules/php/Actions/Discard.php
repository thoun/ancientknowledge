<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class Discard extends \AK\Models\Action
{
  public function getState()
  {
    return ST_DISCARD;
  }

  public function getDescription()
  {
    return [
      'log' => clienttranslate('Discard ${n} card(s)'),
      'args' => [
        'n' => $this->getN(),
      ],
    ];
  }

  public function mustDiscard()
  {
    return $this->getCtxArg('precondition') ?? false;
  }

  public function isOptional()
  {
    $player = Players::getActive();
    return !$this->isDoable($player) && !$this->mustDiscard();
  }

  public function isDoable($player)
  {
    return $player->getHand()->count() >= ($this->mustDiscard() ? $this->getN() : 1);
  }

  public function getN()
  {
    return $this->getCtxArg('n') ?? 1;
  }

  public function argsDiscard()
  {
    $player = Players::getActive();
    $cards = $player->getHand();

    // Do we have any constraint on the type of card to discard ?
    $constraint = $this->getCtxArg('constraint');
    if (!is_null($constraint)) {
      if ($constraint == ARTEFACT) {
        $cards = $player->getArtefacts();
      } else {
        $cards = $cards->filter(function ($card) use ($constraint) {
          return in_array($card->getType(), $constraint);
        });
      }
    }

    return [
      'n' => $this->getN(),
      '_private' => [
        'active' => [
          'cardIds' => $cards->getIds(),
        ],
      ],
    ];
  }

  public function stDiscard()
  {
    $args = $this->argsDiscard();
    $cardIds = $args['_private']['active']['cardIds'];
    if (count($cardIds) <= $args['n']) {
      $this->actDiscard($cardIds, true);
    }
  }

  public function actDiscard($cardIds, $auto = false)
  {
    // Sanity checks
    self::checkAction('actDiscard', $auto);
    $player = Players::getActive();
    $args = $this->argsDiscard();
    if (count($cardIds) != $args['n']) {
      if ($this->mustDiscard() || count($args['_private']['active']['cardIds']) >= $args['n']) {
        throw new \BgaVisibleSystemException('Invalid number of cards to discard. Should not happen');
      }
    }
    if (!empty(array_diff($cardIds, $args['_private']['active']['cardIds']))) {
      throw new \BgaVisibleSystemException('Invalid cards to discard. Should not happen');
    }

    // Discard cards
    $cards = Cards::getMany($cardIds);
    Cards::discard($cardIds);
    Notifications::discardCards($player, $cards);

    $this->resolveAction(['n' => count($cardIds)]);
  }
}
