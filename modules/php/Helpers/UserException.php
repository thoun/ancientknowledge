<?php
namespace AK\Helpers;
use AK\Core\Game;

class UserException extends \BgaUserException
{
  public function __construct($str)
  {
    parent::__construct(Game::get()->translate($str));
  }
}
?>
