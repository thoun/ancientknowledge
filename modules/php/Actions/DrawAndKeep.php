<?php
namespace AK\Actions;
use AK\Managers\Meeples;
use AK\Managers\Players;
use AK\Managers\Cards;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class DrawAndKeep extends \AK\Models\Action
{
  public function getState()
  {
    return ST_DRAW_AND_KEEP;
  }

  public function getDescription()
  {
    $n = $this->getN();
    $n = $this->getM();
    return [
      'log' => clienttranslate('Draw ${n} cards and keep ${m}'),
      'args' => [
        'n' => $n,
        'm' => $m,
      ],
    ];
  }

  public function isIrreversible($player = null)
  {
    return true;
  }

  public function getN()
  {
    return $this->getCtxArg('n') ?? 1;
  }
  public function getM()
  {
    return $this->getCtxArg('m') ?? 1;
  }

  public function stPreDrawAndKeep()
  {
    $player = Players::getActive();
    $n = $this->getN();

    $cards = Cards::draw($player, $n, 'deck', 'pending');
  }

  public function argsDrawAndKeep()
  {
    $player = Players::getActive();
    $cards = Cards::getInLocation('pending');

    return [
      'n' => $this->getN(),
      'm' => $this->getM(),
      '_private' => [
        'active' => [
          'cardIds' => $cards->getIds(),
        ],
      ],
    ];
  }

  public function actDrawAndKeep($cardId)
  {
    self::checkAction('actDrawAndKeep');
    $cardIds = $this->argsDrawAndKeep()['_private']['active']['cardIds'];
    if (!in_array($cardId, $cardIds)) {
      throw new \BgaVisibleSystemException('Invalid card to keep. Should not happen');
    }

    // Move card to hand
    $player = Players::getActive();
    $card = Cards::getSingle($cardId);
    $card->setLocation('hand');
    $card->setPId($player->getId());

    // Discard the other ones
    $cardLeftIds = array_diff($cardIds, [$cardId]);
    Cards::move($cardLeftIds, 'discard');

    // Notify
    Notifications::keepAndDiscard($player, $card, Cards::getMany($cardLeftIds));

    $this->resolveAction();
  }
}
