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

  public function getPlayableTechs($player, $isDoable = false)
  {
    $pool = Technologies::getPool();
    $techs = [];
    $check = $this->getCtxArg('checkRequirements') ?? true;
    foreach ($pool as $tId => $tech) {
      if ($check && !$tech->canBePlayed($player)) {
        continue;
      }

      if ($isDoable) {
        return true;
      }
      $techs[] = $tId;
    }

    return $isDoable ? false : $techs;
  }

  public function argsLearn()
  {
    $player = Players::getActive();
    return [
      'techs' => $this->getPlayableTechs($player),
    ];
  }

  public function actLearn($techId)
  {
    // Sanity checks
    self::checkAction('actLearn');
    $player = Players::getActive();
    $techs = $this->argsLearn()['techs'];
    if (!in_array($techId, $techs)) {
      throw new \BgaVisibleSystemException('Invalid tech to learn. Should not happen');
    }

    // Move Tech
    $tech = Technology::getSingle($techId);
    $tech->setLocation('inPlay');
    $tech->setPId($player->getId());
    Notifications::learnTech($player, $tech);

    // Check immediate effect
    if ($tech->getActivation() == \IMMEDIATE) {
      die('TODO: immediate effect of created card');
    }

    // Check listener
    // TODO

    $this->resolveAction(['techId' => $techId]);
  }
}
