<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * AncientKnowledge implementation : © Timothée Pecatte <tim.pecatte@gmail.com>, Guy Baudin <guy.thoun@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * gameoptions.inc.php
 *
 * AncientKnowledge game options description
 *
 * In this file, you can define your game options (= game variants).
 *
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in ancientknowledge.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

namespace AK;

require_once 'modules/php/constants.inc.php';

$game_options = [
  OPTION_FIRST_GAME => [
    'name' => totranslate('First game'),
    'values' => [
      OPTION_FIRST_GAME_ENABLED => [
        'name' => totranslate('Enabled'),
        'tmdisplay' => totranslate('First game'),
        'description' => totranslate('Each player will receive a pre-made starting hand'),
      ],
      OPTION_FIRST_GAME_DISABLED => [
        'name' => totranslate('Disabled'),
      ],
    ],
  ],

  OPTION_SCORING => [
    'name' => totranslate('Live scoring'),
    'values' => [
      OPTION_SCORING_ENABLED => [
        'name' => totranslate('Enabled'),
      ],
      OPTION_SCORING_DISABLED => [
        'name' => totranslate('Disabled'),
        'tmdisplay' => totranslate('No live scoring'),
      ],
    ],
    'default' => OPTION_SCORING_ENABLED,
  ],
];

$game_preferences = [
  OPTION_CONFIRM => [
    'name' => totranslate('Turn confirmation'),
    'needReload' => false,
    'default' => OPTION_CONFIRM_ENABLED,
    'values' => [
      OPTION_CONFIRM_ENABLED => ['name' => totranslate('Enabled')],
      OPTION_CONFIRM_DISABLED => ['name' => totranslate('Disabled')],
      OPTION_CONFIRM_TIMER => [
        'name' => totranslate('Enabled with timer'),
      ],
    ],
  ],
  OPTION_CONFIRM_UNDOABLE => [
    'name' => totranslate('Undoable actions confirmation'),
    'needReload' => false,
    'values' => [
      OPTION_CONFIRM_ENABLED => ['name' => totranslate('Enabled')],
      OPTION_CONFIRM_DISABLED => ['name' => totranslate('Disabled')],
    ],
  ],
];
