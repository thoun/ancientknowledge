<?php
namespace AK\Actions;
use AK\Managers\Effects;

class SpecialEffect extends \AK\Models\Action
{
  public function getState()
  {
    return ST_SPECIAL_EFFECT;
  }

  public function isDoable($player, $ignoreResources = false)
  {
    $args = $this->getCtxArgs();
    $card = Effects::get($args['sourceId']);
    $method = 'is' . \ucfirst($args['method']) . 'Doable';
    $arguments = $args['args'] ?? [];
    return \method_exists($card, $method) ? $card->$method($player, $ignoreResources, ...$arguments) : true;
  }

  public function getDescription($ignoreResources = false)
  {
    $args = $this->getCtxArgs();
    $card = Effects::get($args['sourceId']);
    $method = 'get' . \ucfirst($args['method']) . 'Description';
    $arguments = $args['args'] ?? [];
    return \method_exists($card, $method) ? $card->$method(...$arguments) : '';
  }

  public function isIndependent($player = null)
  {
    $args = $this->getCtxArgs();
    $card = Effects::get($args['sourceId']);
    $method = 'isIndependent' . \ucfirst($args['method']);
    return \method_exists($card, $method) ? $card->$method($player) : false;
  }

  public function isAutomatic($player = null)
  {
    $args = $this->getCtxArgs();
    $card = Effects::get($args['sourceId']);
    $method = $args['method'];
    return \method_exists($card, $method);
  }

  public function stSpecialEffect()
  {
    $args = $this->getCtxArgs();
    $card = Effects::get($args['sourceId']);
    $method = $args['method'];
    $arguments = $args['args'] ?? [];
    if (\method_exists($card, $method)) {
      $card->$method(...$arguments);
      $this->resolveAction();
    }
  }

  public function argsSpecialEffect()
  {
    $args = $this->getCtxArgs();
    $card = Effects::get($args['sourceId']);
    $method = 'args' . \ucfirst($args['method']);
    $arguments = $args['args'] ?? [];
    return \method_exists($card, $method) ? $card->$method(...$arguments) : [];
  }

  public function actSpecialEffect(...$actArgs)
  {
    $args = $this->getCtxArgs();
    $card = Effects::get($args['sourceId']);
    $method = 'act' . \ucfirst($args['method']);
    $arguments = $args['args'] ?? [];
    if (!\method_exists($card, $method)) {
      throw new BgaVisibleSystemException('Corresponding act function does not exists : ' . $method);
    }

    $card->$method(...array_merge($actArgs, $arguments));
    $this->resolveAction();
  }
}
