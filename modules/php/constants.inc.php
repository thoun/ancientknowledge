<?php

/*
 * Game options
 */

const OPTION_FIRST_GAME = 101;
const OPTION_FIRST_GAME_ENABLED = 0;
const OPTION_FIRST_GAME_DISABLED = 1;

const OPTION_SCORING = 102;
const OPTION_SCORING_ENABLED = 1;
const OPTION_SCORING_DISABLED = 0;

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
const ST_SETUP_BRANCH = 2;
const ST_INITIAL_SELECTION = 3;
const ST_FINISH_SETUP = 4;

const ST_TURNACTION = 6;
const ST_TIMELINE_PHASE = 7;
const ST_DECLINE_PHASE = 8;
const ST_DECLINE_CARD = 9;

// ATOMIC ACTIONS
const ST_GAIN = 10;
const ST_CHOOSE_ACTION = 11;
const ST_CREATE = 12;
const ST_LEARN = 13;
const ST_EXCAVATE = 14;
const ST_ARCHIVE = 15;

const ST_DRAW = 20;
const ST_DISCARD_LOST_KNOWLEDGE = 21;
const ST_ACTIVATE_CARD = 22;
const ST_REMOVE_KNOWLEDGE = 23;
const ST_DISCARD = 24;
const ST_SWAP = 25;
const ST_MOVE_BUILDING = 26;
const ST_DESTROY = 27;
const ST_ADD_KNOWLEDGE = 28;
const ST_STRAIGHTEN = 29;
const ST_DISCARD_MULTI = 30;
const ST_DRAW_AND_KEEP = 31;
const ST_FLIP_TECH_TILE = 32;

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

const ST_BREAK_MULTIACTIVE = 20000;

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

const CHOOSE_ACTION = 'CHOOSE_ACTION';
const TIMELINE_PHASE = 'TIMELINE_PHASE';
const DECLINE_PHASE = 'DECLINE_PHASE';

const ACTIVATE_CARD = 'ACTIVATE_CARD';
const GAIN = 'GAIN';
const DRAW = 'DRAW';
const DISCARD_LOST_KNOWLEDGE = 'DISCARD_LOST_KNOWLEDGE';
const REMOVE_KNOWLEDGE = 'REMOVE_KNOWLEDGE';
const DECLINE_CARD = 'DECLINE_CARD';
const DISCARD = 'DISCARD';
const DESTROY = 'DESTROY';
const SWAP = 'SWAP';
const MOVE_BUILDING = 'MOVE_BUILDING';
const ADD_KNOWLEDGE = 'ADD_KNOWLEDGE';
const STRAIGHTEN = 'STRAIGHTEN';
const DISCARD_MULTI = 'DISCARD_MULTI';
const DRAW_AND_KEEP = 'DRAW_AND_KEEP';

const FLIP_TECH_TILE = 'FLIP_TECH_TILE';

const CREATE = 'CREATE';
const LEARN = 'LEARN';
const ARCHIVE = 'ARCHIVE';
const EXCAVATE = 'EXCAVATE';
const SEARCH = 'SEARCH';

/*
 * Cards
 */

const CITY = 'city';
const MEGALITH = 'megalith';
const PYRAMID = 'pyramid';
const ARTEFACT = 'artefact';

const ANYTIME = 'anytime';
const DECLINE = 'decline';
const IMMEDIATE = 'immediate';
const TIMELINE = 'timeline';
const ENDGAME = 'endgame';

const ANCIENT = 'ancient';
const WRITING = 'writing';
const SECRET = 'secret';

const BUILDINGS = [CITY, MEGALITH, PYRAMID];
const TECHNOLOGIES = [ANCIENT, WRITING, SECRET];
const ICONS = [CITY, MEGALITH, PYRAMID, ARTEFACT, ANCIENT, WRITING, SECRET];

/*
 * MISC
 */

const KNOWLEDGE = 'knowledge';
const LOST_KNOWLEDGE = 'lost-knowledge';

/*
 * Scoring categories
 */
const SCORING_BUILDINGS = 'past';
const SCORING_EFFECTS = 'effects';
const SCORING_TECHS = 'techs';
const SCORING_TIMELINE = 'timeline';
const SCORING_LOST_KNOWNLEDGE = 'knowledge';
const SCORING_CATEGORIES = [SCORING_BUILDINGS, SCORING_EFFECTS, SCORING_TECHS, SCORING_TIMELINE, SCORING_LOST_KNOWNLEDGE];

const SCORING_TOTAL = 'total';

/******************
 ****** STATS ******
 ******************/

const STAT_POSITION = 11;
