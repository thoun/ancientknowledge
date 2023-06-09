<?php
namespace AK\Core;
use AncientKnowledge;

/*
 * Game: a wrapper over table object to allow more generic modules
 */
class Game
{
  public static function get()
  {
    return AncientKnowledge::get();
  }
}
