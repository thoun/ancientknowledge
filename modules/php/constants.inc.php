<?php

/*
 * Game options
 */

const OPTION_FIRST_GAME = 101;
const OPTION_FIRST_GAME_ENABLED = 0;
const OPTION_FIRST_GAME_DISABLED = 1;

/*
 * User preferences
 */
const OPTION_CONFIRM = 103;
const OPTION_CONFIRM_DISABLED = 0;
const OPTION_CONFIRM_ENABLED = 2;
const OPTION_CONFIRM_TIMER = 3;

const OPTION_CONFIRM_UNDOABLE = 104;

/*
 * State constants
 */
const ST_GAME_SETUP = 1;

// ATOMIC ACTIONS
const ST_GAIN = 10;
const ST_PLACE_AMBASSADOR = 11;

// ENGINE
const ST_RESOLVE_STACK = 90;
const ST_RESOLVE_CHOICE = 91;
const ST_IMPOSSIBLE_MANDATORY_ACTION = 92;
const ST_CONFIRM_TURN = 93;
const ST_CONFIRM_PARTIAL_TURN = 94;
const ST_GENERIC_NEXT_PLAYER = 97;

// END
const ST_PRE_END_OF_GAME = 98;
const ST_END_GAME = 99;

/*
 * ENGINE
 */
const NODE_SEQ = 'seq';
const NODE_OR = 'or';
const NODE_XOR = 'xor';
const NODE_PARALLEL = 'parallel';
const NODE_LEAF = 'leaf';

const ZOMBIE = 98;
const PASS = 99;

/*
 * Atomic action
 */

const GAIN = 'GAIN';

const CREATE = 'CREATE';
const LEARN = 'LEARN';
const ARCHIVE = 'ARCHIVE';
const EXCAVATE = 'EXCAVATE';
const SEARCH = 'SEARCH';

/*
 * Cards
 */

const CITY = 'city';
const MONOLITH = 'monolith';
const PYRAMID = 'pyramid';
const ARTEFACT = 'artefact';

const ANYTIME = 'anytime';
const DECLINE = 'decline';
const IMMEDIATE = 'immediate';
const ENDTURN = 'endturn';
const ENDGAME = 'endgame';

const ANCIENT = 'ancient';
const WRITING = 'writing';
const SECRET = 'secret';

/*
 * MISC
 */

const KNOWLEDGE = 'knowledge';
const LOST_KNOWLEDGE = 'lost-knowledge';

/******************
 ****** STATS ******
 ******************/

const STAT_POSITION = 11;
