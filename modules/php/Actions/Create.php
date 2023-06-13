<?php
namespace AK\Actions;
use AK\Managers\Meeples;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class Create extends \AK\Models\Action
{
  public function getState()
  {
    return ST_CREATE;
  }

  public function getDescription()
  {
    return clienttranslate('Create');
  }

  public function argsCreate()
  {
    return [];
  }

  public function actCreate($cardId, $slot)
  {
    self::checkAction('actCreate');
    die('test');
  }
}
