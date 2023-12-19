<?php
namespace AK\Core;
use AK\Managers\Players;
use AK\Helpers\Utils;
use AK\Helpers\Collection;
use AK\Core\Globals;
use AK\Managers\Effects;
use AK\Managers\Technologies;

class Notifications
{
  /*************************
   **** GENERIC METHODS ****
   *************************/
  protected static function notifyAll($name, $msg, $data)
  {
    self::updateArgs($data);
    Game::get()->notifyAllPlayers($name, $msg, $data);
  }

  protected static function notify($player, $name, $msg, $data)
  {
    $pId = is_int($player) ? $player : $player->getId();
    self::updateArgs($data);
    Game::get()->notifyPlayer($pId, $name, $msg, $data);
  }

  public static function message($txt, $args = [])
  {
    self::notifyAll('mediumMessage', $txt, $args);
  }

  public static function messageTo($player, $txt, $args = [])
  {
    $pId = is_int($player) ? $player : $player->getId();
    self::notify($pId, 'message', $txt, $args);
  }

  public static function newUndoableStep($player, $stepId)
  {
    self::notify($player, 'newUndoableStep', clienttranslate('Undo here'), [
      'stepId' => $stepId,
      'preserve' => ['stepId'],
    ]);
  }

  public static function clearTurn($player, $notifIds)
  {
    self::notifyAll('clearTurn', clienttranslate('${player_name} restarts their turn'), [
      'player' => $player,
      'notifIds' => $notifIds,
    ]);
  }

  public static function refreshUI($datas)
  {
    unset($datas['prefs']);
    self::notifyAll('refreshUI', '', [
      'datas' => $datas,
    ]);
  }

  public static function refreshHand($player, $hand)
  {
    self::notify($player, 'refreshHand', '', [
      'player' => $player,
      'hand' => $hand,
    ]);
  }

  public static function chooseAction($player, $actionName)
  {
    $actions = [
      'archive' => \clienttranslate('Archive'),
      'create' => \clienttranslate('Create'),
      'learn' => \clienttranslate('Learn'),
      'search' => \clienttranslate('Search'),
      'excavate' => \clienttranslate('Excavate'),
    ];

    self::notifyAll('chooseAction', \clienttranslate('${player_name} chooses the action: ${action_name}'), [
      'player' => $player,
      'i18n' => ['action_name'],
      'action_name' => $actions[$actionName],
    ]);
  }

  public static function discardLostKnowledge($player, $n)
  {
    self::notifyAll(
      'discardLostKnowledge',
      clienttranslate('${player_name} discard ${n} <LOST_KNOWLEDGE> and now has ${m} left'),
      [
        'player' => $player,
        'n' => $n,
        'm' => $player->getLostKnowledge(),
      ]
    );
  }

  public static function skipDeclinePhase($player)
  {
    self::notifyAll('mediumMessage', clienttranslate('${player_name} skips their decline phase due to Potala Palace\'s effect'), [
      'player' => $player,
    ]);
  }

  public static function skipTimelinePhase($player)
  {
    self::notifyAll('mediumMessage', clienttranslate('${player_name} Timeline phase is skipped (no Timeline phase effect)'), [
      'player' => $player,
    ]);
  }

  //////////////////////////////
  //  _____         _
  // |_   _|__  ___| |__  ___
  //   | |/ _ \/ __| '_ \/ __|
  //   | |  __/ (__| | | \__ \
  //   |_|\___|\___|_| |_|___/
  //////////////////////////////

  public static function fillPool($techs)
  {
    self::notifyAll('fillPool', clienttranslate('Technology tiles are filled up with ${card_names}'), [
      'cards' => $techs,
    ]);
  }

  public static function learnTech($player, $tech)
  {
    self::notifyAll('createCard', clienttranslate('${player_name} learns ${card_name}'), [
      'player' => $player,
      'card' => $tech,
      'icons' => $player->getIcons(),
    ]);
  }

  public static function clearTechBoard($board, $left)
  {
    self::notifyAll('clearTechBoard', \clienttranslate('Clearing up technology tile n°${board} by discarding ${card_names}'), [
      'board' => $board,
      'cards' => $left->toArray(),
    ]);
  }

  public static function fillUpTechBoard($board, $cards)
  {
    self::notifyAll('fillUpTechBoard', \clienttranslate('Filling up technology tile n°${board} with ${card_names}'), [
      'board' => $board,
      'cards' => $cards->toArray(),
      'techsDeckLvl1' => Technologies::countInLocation('deck_1'),
      'techsDeckLvl2' => Technologies::countInLocation('deck_2'),
    ]);
  }

  public static function reformTechDeck($deck)
  {
    $level = $deck == 'deck_1' ? 1 : 2;
    self::notifyAll(
      'reformTechDeck',
      $level == 1
        ? \clienttranslate('Reforming deck of level 1 technology cards')
        : \clienttranslate('Reforming deck of level 2 technology cards'),
      [
        'level' => $level,
      ]
    );
  }

  public static function midGameReached($player, $discarded, $board)
  {
    self::notifyAll(
      'midGameReached',
      \clienttranslate(
        '${player_name} has 7 buildings in their past, triggering the middle of the game. The technology tile n°${board} is cleared by discarding ${card_names}'
      ),
      [
        'player' => $player,
        'cards' => $discarded->toArray(),
        'board' => $board,
      ]
    );
  }

  public static function endOfGameTriggered($player)
  {
    self::notifyAll(
      'endOfGameTriggered',
      \clienttranslate('${player_name} has 14 buildings in their past, triggering the end of the game.'),
      ['player' => $player]
    );
  }

  public static function scoringEntry($player, $category, $score)
  {
    $msgs = [
      SCORING_BUILDINGS => clienttranslate('${player_name} scores ${n} <VP> from monuments in their past'),
      SCORING_EFFECTS => clienttranslate('${player_name} scores ${n} <VP> from endgame monument effects in their past'),
      SCORING_TECHS => clienttranslate('${player_name} scores ${n} <VP> from learnt technology cards'),
      SCORING_TIMELINE => clienttranslate('${player_name} scores ${n} <VP> for monuments left in their timeline'),
      SCORING_LOST_KNOWNLEDGE => clienttranslate('${player_name} lost ${m} <VP> for lost knowledge on their board'),
      SCORING_TOTAL => clienttranslate('${player_name} final score is ${n} <VP>'),
    ];
    self::notifyAll('scoringEntry', $msgs[$category], [
      'player' => $player,
      'n' => $score,
      'm' => -$score, // only useful for lost knowledge
      'category' => $category,
    ]);
  }

  public static function updateScores($scores)
  {
    self::notifyAll('updateScores', '', [
      'scores' => $scores,
    ]);
  }

  ///////////////////////////
  //    ____              _
  //   / ___|__ _ _ __ __| |___
  //  | |   / _` | '__/ _` / __|
  //  | |__| (_| | | | (_| \__ \
  //   \____\__,_|_|  \__,_|___/
  ///////////////////////////

  public static function updateInitialSelection($player, $args)
  {
    self::notify($player, 'updateInitialSelection', '', [
      'args' => ['_private' => $args['_private'][$player->getId()]],
    ]);
  }

  public static function drawCards($player, $cards, $sourceId = null)
  {
    if (is_null($sourceId)) {
      self::notifyAll('drawCards', clienttranslate('${player_name} draws ${n} card(s) from the deck'), [
        'player' => $player,
        'n' => count($cards),
      ]);
      self::notify($player, 'pDrawCards', clienttranslate('You draw ${card_names} from the deck'), [
        'player' => $player,
        'cards' => is_array($cards) ? $cards : $cards->toArray(),
      ]);
    } else {
      $source = Effects::get($sourceId);
      self::notifyAll('drawCards', clienttranslate('${player_name} draws ${n} card(s) from the deck (${card_name})'), [
        'player' => $player,
        'n' => count($cards),
        'card' => $source,
      ]);
      self::notify($player, 'pDrawCards', clienttranslate('You draw ${card_names} from the deck (${card_name})'), [
        'player' => $player,
        'cards' => is_array($cards) ? $cards : $cards->toArray(),
        'card' => $source,
      ]);
    }
  }

  public static function discardCards($player, $cards, $privateMsg = null, $publicMsg = null, $args = [], $privateArgs = null)
  {
    self::notifyAll(
      'discardCards',
      $publicMsg ?? clienttranslate('${player_name} discards ${n} card(s)'),
      $args + [
        'player' => $player,
        'n' => count($cards),
      ]
    );
    self::notify(
      $player,
      'pDiscardCards',
      $privateMsg ?? clienttranslate('You discard ${card_names}'),
      ($privateArgs ?? $args) + [
        'player' => $player,
        'cards' => $cards->toArray(),
      ]
    );
  }

  public static function createCard($player, $card, $sourceId)
  {
    if (is_null($sourceId)) {
      self::notifyAll('createCard', clienttranslate('${player_name} creates ${card_name}'), [
        'player' => $player,
        'card' => $card,
        'icons' => $player->getIcons(),
      ]);
    } else {
      self::notifyAll('createCard', clienttranslate('${player_name} creates ${card_name} (${card2_name})'), [
        'player' => $player,
        'card' => $card,
        'card2' => Effects::get($sourceId),
        'icons' => $player->getIcons(),
      ]);
    }
  }

  public static function rotateCards($player, $cards)
  {
    self::notifyAll('rotateCards', clienttranslate('${player_name} rotates ${card_names} in their past'), [
      'player' => $player,
      'cards' => $cards->toArray(),
    ]);
  }

  public static function declineSlideLeft($player, $n)
  {
    self::notifyAll(
      'declineSlideLeft',
      \clienttranslate('${player_name} slides the ${n} card(s) on their timeline one space to the left'),
      [
        'player' => $player,
        'n' => $n,
      ]
    );
  }

  public static function declineCard($player, $card, $knowledge)
  {
    $msg =
      $knowledge > 0
        ? clienttranslate('${player_name} moves ${card_name} to the past and gets ${n} <LOST_KNOWLEDGE> as a result')
        : clienttranslate('${player_name} moves ${card_name} to the past');
    self::notifyAll('declineCard', $msg, [
      'player' => $player,
      'card' => $card,
      'n' => $knowledge,
      'icons' => $player->getIcons(),
    ]);
  }

  public static function removeKnowledge($player, $total, $cards, $sourceId)
  {
    self::notifyAll('removeKnowledge', \clienttranslate('${player_name} removes ${n} knowledge from ${card_names}${source}'), [
      'player' => $player,
      'n' => $total,
      'cards' => $cards,
      'sourceId' => $sourceId,
    ]);
  }

  public static function addKnowledge($player, $n, $cards, $sourceId)
  {
    self::notifyAll(
      'addKnowledge',
      \clienttranslate('${player_name} adds ${n} knowledge on opponents\' cards ${card_names}${source}'),
      [
        'player' => $player,
        'n' => $n,
        'cards' => $cards,
        'sourceId' => $sourceId,
      ]
    );
  }

  public static function addKnowledgeFromBoard($player, $target, $n, $card, $sourceId)
  {
    self::notifyAll(
      'addKnowledgeFromBoard',
      \clienttranslate('${player_name} adds ${n} knowledge from their board on ${player_name2}\'s card ${card_name}${source}'),
      [
        'player' => $player,
        'player2' => $target,
        'n' => $n,
        'card' => $card,
        'sourceId' => $sourceId,
      ]
    );
  }

  public static function swapCards($player, $card1, $card2, $source)
  {
    self::notifyAll(
      'swapCards',
      \clienttranslate('${player_name} swaps ${card_name} with ${card2_name} on their timeline (${card3_name})'),
      [
        'player' => $player,
        'card' => $card1,
        'card2' => $card2,
        'card3' => $source,
      ]
    );
  }

  public static function moveBuilding($player, $card, $sourceId)
  {
    self::notifyAll('moveCard', \clienttranslate('${player_name} move ${card_name}${source}'), [
      'player' => $player,
      'card' => $card,
      'sourceId' => $sourceId,
    ]);
  }

  public static function destroyCard($player, $card)
  {
    self::notifyAll('destroyCard', clienttranslate('${player_name} discards ${card_name}'), [
      'player' => $player,
      'card' => $card,
    ]);
  }

  public static function straighten($player, $cards)
  {
    self::notifyAll('straightenCards', \clienttranslate('${player_name} straightens ${card_names} in their past'), [
      'player' => $player,
      'cards' => $cards,
    ]);
  }

  public static function keepAndDiscard($player, $card, $cards, $public = false)
  {
    self::notifyAll('keepAndDiscard', clienttranslate('${player_name} keeps 1 card'), [
      'player' => $player,
    ]);
    self::notify($player, 'keepAndDiscard', clienttranslate('You keep ${card_name} and discard ${card_names}'), [
      'player' => $player,
      'card' => $card,
      'cards' => $cards->toArray(),
    ]);
  }

  public static function keep($player, $card)
  {
    self::notifyAll('keep', clienttranslate('${player_name} keeps ${card_name}'), [
      'player' => $player,
      'card' => $card,
    ]);
  }

  public static function cantkeep($player)
  {
    self::notifyAll('mediumMessage', clienttranslate('${player_name} already has 10 cards in hand'), [
      'player' => $player,
    ]);
  }

  public static function placeAtDeckBottom($player, $tech, $deck)
  {
    self::notifyAll(
      'placeAtDeckBottom',
      clienttranslate('${player_name} put ${card_name} on the bottom of the corresponding deck'),
      [
        'player' => $player,
        'card' => $tech,
        'deck' => $deck,
      ]
    );
  }

  public static function steal($player, $target, $card)
  {
    self::notifyAll('stealCard', clienttranslate('${player_name} steals one card from ${player_name2}'), [
      'player' => $player,
      'player2' => $target,
    ]);
    self::notify($player, 'pStealCard', clienttranslate('You steal ${card_name} from ${player_name2}'), [
      'card' => $card,
      'player' => $player,
      'player2' => $target,
    ]);
    self::notify($target, 'pStealCard', clienttranslate('${player_name} steal ${card_name} from you'), [
      'card' => $card,
      'player' => $player,
      'player2' => $target,
    ]);
  }

  ///////////////////////////////////////////////////////////////
  //  _   _           _       _            _
  // | | | |_ __   __| | __ _| |_ ___     / \   _ __ __ _ ___
  // | | | | '_ \ / _` |/ _` | __/ _ \   / _ \ | '__/ _` / __|
  // | |_| | |_) | (_| | (_| | ||  __/  / ___ \| | | (_| \__ \
  //  \___/| .__/ \__,_|\__,_|\__\___| /_/   \_\_|  \__, |___/
  //       |_|                                      |___/
  ///////////////////////////////////////////////////////////////

  /*
   * Automatically adds some standard field about player and/or card
   */
  protected static function updateArgs(&$data)
  {
    if (isset($data['player'])) {
      $data['player_name'] = $data['player']->getName();
      $data['player_id'] = $data['player']->getId();
      unset($data['player']);
    }
    if (isset($data['player2'])) {
      $data['player_name2'] = $data['player2']->getName();
      $data['player_id2'] = $data['player2']->getId();
      unset($data['player2']);
    }
    if (isset($data['players'])) {
      $args = [];
      $logs = [];
      foreach ($data['players'] as $i => $player) {
        $logs[] = '${player_name' . $i . '}';
        $args['player_name' . $i] = $player->getName();
      }
      $data['players_names'] = [
        'log' => join(', ', $logs),
        'args' => $args,
      ];
      $data['i18n'][] = 'players_names';
      unset($data['players']);
    }

    if (isset($data['resources'])) {
      // Get an associative array $resource => $amount
      $resources = Utils::reduceResources($data['resources']);
      $data['resources_desc'] = Utils::resourcesToStr($resources);
    }

    if (isset($data['card'])) {
      $data['card_id'] = $data['card']->getId();
      $data['card_name'] = $data['card']->getName();
      $data['i18n'][] = 'card_name';
      $data['preserve'][] = 'card_id';
      $data['card'] = $data['card']->jsonSerialize();
    }

    if (isset($data['card2'])) {
      $data['card2_id'] = $data['card2']->getId();
      $data['card2_name'] = $data['card2']->getName();
      $data['i18n'][] = 'card2_name';
      $data['preserve'][] = 'card2_id';
      $data['card2'] = $data['card2']->jsonSerialize();
    }

    if (isset($data['card3'])) {
      $data['card3_id'] = $data['card3']->getId();
      $data['card3_name'] = $data['card3']->getName();
      $data['i18n'][] = 'card3_name';
      $data['preserve'][] = 'card3_id';
      $data['card3'] = $data['card3']->jsonSerialize();
    }

    if (isset($data['cards'])) {
      $args = [];
      $logs = [];
      foreach ($data['cards'] as $i => $card) {
        $logs[] = '${card_name_' . $i . '}';
        $args['i18n'][] = 'card_name_' . $i;
        $args['card_name_' . $i] = [
          'log' => '${card_name}',
          'args' => [
            'i18n' => ['card_name'],
            'card_name' => is_array($card) ? $card['name'] : $card->getName(),
            'card_id' => is_array($card) ? $card['id'] : $card->getId(),
            'preserve' => ['card_id'],
          ],
        ];
      }
      $data['card_names'] = [
        'log' => join(', ', $logs),
        'args' => $args,
      ];
      $data['i18n'][] = 'card_names';
    }

    if (array_key_exists('sourceId', $data)) {
      if (is_null($data['sourceId'])) {
        $data['source'] = '';
        unset($data['sourceId']);
      } else {
        $source = Effects::get($data['sourceId']);
        $data['source'] = [
          'log' => ' (${card_name})',
          'args' => [
            'card_name' => $source->getName(),
            'card_id' => $source->getId(),
          ],
        ];
        $data['i18n'][] = 'source';
      }
    }
  }
}

?>
