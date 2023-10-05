declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

const ANIMATION_MS = 500;
const MIN_NOTIFICATION_MS = 1200;
const SCORE_ANIMATION_MS = 1500;
const ACTION_TIMER_DURATION = 10;

const LOCAL_STORAGE_ZOOM_KEY = 'AncientKnowledge-zoom';
const LOCAL_STORAGE_JUMP_TO_FOLDED_KEY = 'AncientKnowledge-jump-to-folded';
const LOCAL_STORAGE_HELP_ACTIONS_FOLDED_KEY = 'AncientKnowledge-help-actions-folded';
const LOCAL_STORAGE_HELP_TURN_FOLDED_KEY = 'AncientKnowledge-help-turn-folded';

const ICONS_COUNTERS_TYPES = ['city', 'megalith', 'pyramid', 'artifact'];

const ACTIONS = ['create', 'learn', 'archive', 'excavate', 'search'];

function sleep(ms: number){
    return new Promise((r) => setTimeout(r, ms));
}

class AncientKnowledge implements AncientKnowledgeGame {
    public animationManager: AnimationManager;
    public builderCardsManager: BuilderCardsManager;
    public technologyTilesManager: TechnologyTilesManager;

    private zoomManager: ZoomManager;
    private gamedatas: AncientKnowledgeGamedatas;
    private tableCenter: TableCenter;
    private playersTables: PlayerTable[] = [];
    private handCounters: Counter[] = [];
    private lostKnowledgeCounters: Counter[] = [];

    private artifactCounters: Counter[] = [];
    private cityCounters: Counter[] = [];
    //private cityTimelineCounters: Counter[] = [];
    private megalithCounters: Counter[] = [];
    //private megalithTimelineCounters: Counter[] = [];
    private pyramidCounters: Counter[] = [];
    //private pyramidTimelineCounters: Counter[] = [];

    private drawAndPeekStock: LineStock<BuilderCard>;
    
    private TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;

    private actionTimerId = null;
    private _notif_uid_to_log_id = [];
    private _notif_uid_to_mobile_log_id = [];
    private _last_notif;
    private _last_tooltip_id = 0;
    private tooltipsToMap: [tooltipId: number, card_id: string][] = [];

    private createEngine: CreateEngine;
    private archiveEngine: ArchiveEngine;
    private removeKnowledgeEngine: RemoveKnowledgeEngine;
    private moveBuildingEngine: MoveBuildingEngine;

    private addKnowledgeSelection: { [playerId: string]: string } = {};

    private market?: LineStock<BuilderCard>;

    constructor() {
    }
    
    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */

    public setup(gamedatas: AncientKnowledgeGamedatas) {
        log( "Starting game setup" );
        
        this.gamedatas = gamedatas;

        // TODO TEMP
        Object.values(gamedatas.players).forEach((player, index) => {
            //const playerId = Number(player.id);
            //if (playerId == this.getPlayerId()) {
            //    player.hand = gamedatas.cards.filter(card => card.location == 'hand' && card.pId == playerId);
            //}
            //player.handCount = gamedatas.cards.filter(card => card.location == 'hand' && card.pId == playerId).length;
        });

        // Create a new div for buttons to avoid BGA auto clearing it
        dojo.place("<div id='customActions' style='display:inline-block'></div>", $('generalactions'), 'after');
        dojo.place("<div id='restartAction' style='display:inline-block'></div>", $('customActions'), 'after');

        log('gamedatas', gamedatas);

        this.animationManager = new AnimationManager(this);
        this.builderCardsManager = new BuilderCardsManager(this);
        this.technologyTilesManager = new TechnologyTilesManager(this);
        
        new JumpToManager(this, {
            localStorageFoldedKey: LOCAL_STORAGE_JUMP_TO_FOLDED_KEY,
            topEntries: [
                new JumpToEntry(_('Main board'), 'table-center', { 'color': '#224757' })
            ],
            entryClasses: 'round-point',
            defaultFolded: true,
        });

        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        
        this.zoomManager = new ZoomManager({
            element: document.getElementById('table'),
            smooth: false,
            zoomControls: {
                color: 'black',
            },
            localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
            onDimensionsChange: () => {
                const tablesAndCenter = document.getElementById('tables-and-center');
                const clientWidth = tablesAndCenter.clientWidth;
                const doubleColumn = clientWidth > (903 + 20 + 1574); // table size + gap + player board size
                tablesAndCenter.classList.toggle('double-column', doubleColumn);
                if (doubleColumn) {
                    document.getElementById(`table-center`).classList.remove('folded');
                }
            },
        });

        new HelpManager(this, { 
            buttons: [
                new BgaHelpPopinButton({
                    title: _("Card help").toUpperCase(),
                    html: this.getHelpHtml(),
                    buttonBackground: '#87a04f',
                }),
                new BgaHelpExpandableButton({
                    expandedWidth: '326px',
                    expandedHeight: '456px',
                    defaultFolded: true,
                    localStorageFoldedKey: LOCAL_STORAGE_HELP_ACTIONS_FOLDED_KEY,
                    buttonExtraClasses: `help-actions`,
                    unfoldedHtml: this.getHelpActionsHtml(),
                }),
                new BgaHelpExpandableButton({
                    expandedWidth: '326px',
                    expandedHeight: '456px',
                    defaultFolded: true,
                    localStorageFoldedKey: LOCAL_STORAGE_HELP_TURN_FOLDED_KEY,
                    buttonExtraClasses: `help-turn`,
                    unfoldedHtml: this.getHelpTurnHtml(),
                }),
            ]
        });
        this.setupNotifications();
        this.setupPreferences();

        const isEnd = this.getGameStateName() == 'gameEnd';
        if (gamedatas.endOfGameTriggered && !isEnd) {
            this.notif_endOfGameTriggered(false);
        }
        if (isEnd) {
            this.onEnteringEndScore(true);
        }

        log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        log('Entering state: ' + stateName, args.args);

        if (args.args?.descSuffix) {
          this.changePageTitle(args.args.descSuffix);
        }
  
        if (args.args?.optionalAction) {
          let base = args.args.descSuffix ?? '';
          this.changePageTitle(base + 'skippable');
        }
        
        if (args.args?.source) {
            if (this.gamedatas.gamestate.descriptionmyturn.search('{source}') === -1) {
              if (args.args.sourceId) {
                let card = this.builderCardsManager.getFullCardById(args.args.sourceId);
                /* TODO let uid = this.registerCustomTooltip(this.tplZooCard(card, true));
    
                $('pagemaintitletext').insertAdjacentHTML(
                  'beforeend',
                  ` (<span class="ark-log-card-name" id="${uid}">${_(args.args.source)}</span>)`
                );
                this.attachRegisteredTooltips();*/

                $('pagemaintitletext').insertAdjacentHTML(
                    'beforeend',
                    ` (<span class="title-log-card-name" id="tooltip-${this._last_tooltip_id}">${_(args.args.source)}</span>)`
                );
                this.setTooltip(`tooltip-${this._last_tooltip_id}`, card.name);
                this._last_tooltip_id++;
                
              } else {
                $('pagemaintitletext').insertAdjacentHTML('beforeend', ` (${_(args.args.source)})`);
              }
            }
        }

        if (/* TODO? this._activeStates.includes(stateName) ||*/ (this as any).isCurrentPlayerActive()) {  
            if (args.args?.optionalAction && !args.args.automaticAction) {
            this.addSecondaryActionButton(
                'btnPassAction',
                _('Pass'),
                () => this.takeAction('actPassOptionalAction'),
                'restartAction'
            );
            }

            // Undo last steps
            args.args?.previousSteps?.forEach((stepId: number) => {
                let logEntry = $('logs').querySelector(`.log.notif_newUndoableStep[data-step="${stepId}"]`);
                if (logEntry) {
                    this.onClick(logEntry, () => this.undoToStep(stepId));
                }

                logEntry = document.querySelector(`.chatwindowlogs_zone .log.notif_newUndoableStep[data-step="${stepId}"]`);
                if (logEntry) {
                    this.onClick(logEntry, () => this.undoToStep(stepId));
                }
            });

            // Restart turn button
            if (args.args?.previousEngineChoices >= 1 && !args.args.automaticAction) {
            if (args.args?.previousSteps) {
                let lastStep = Math.max(...args.args.previousSteps);
                if (lastStep > 0)
                this.addDangerActionButton('btnUndoLastStep', _('Undo last step'), () => this.undoToStep(lastStep), 'restartAction');
            }
    
            // Restart whole turn
            this.addDangerActionButton(
                'btnRestartTurn',
                _('Restart turn'),
                () => {
                this.stopActionTimer();
                this.takeAction('actRestart');
                },
                'restartAction'
            );
            }
        }
  
        if ((this as any).isCurrentPlayerActive() && args.args) {
            // Anytime buttons
            args.args.anytimeActions?.forEach((action, i) => {
                let msg = action.desc;
                msg = msg.log ? this.format_string_recursive(msg.log, msg.args) : _(msg);
                msg = formatTextIcons(msg);

                this.addPrimaryActionButton(
                'btnAnytimeAction' + i,
                msg,
                () => this.takeAction('actAnytimeAction', { id: i }/*, false*/),
                'anytimeActions'
                );
            });
        }

        switch (stateName) {
            case 'create':
                this.onEnteringCreate(args.args);
                break;
            case 'archive':
                this.onEnteringArchive(args.args);
                break;
            case 'learn':
                this.onEnteringLearn(args.args);
                break;
            case 'addKnowledge':
                this.onEnteringAddKnowledge(args.args, true);
                break;
            case 'addKnowledgeFromBoard':
                this.onEnteringAddKnowledge(args.args, false);
                break;
            case 'removeKnowledge':
                this.onEnteringRemoveKnowledge(args.args);
                break;
            case 'resolveChoice':
                this.onEnteringResolveChoice(args.args);
                break;
            case 'swap':
                this.onEnteringSwap(args.args);
                break;
            case 'excavate':
                this.onEnteringExcavate(args.args);
                break;
            case 'drawAndKeep':
                this.onEnteringDrawAndKeep(args.args);
                break;
            case 'moveBuilding':
                this.onEnteringMoveBuilding(args.args);
                break;
            case 'flipTechTile':
                this.onEnteringFlipTechTile();
                break;
            case 'specialEffect':
                this.onEnteringSpecialEffect(args.args);
                break;
        }
    }

    /*
     * Add a blue/grey button if it doesn't already exists
     */
    public addPrimaryActionButton(id, text, callback, zone = 'customActions'): void {
      if (!$(id)) (this as any).addActionButton(id, text, callback, zone, false, 'blue');
    }

    public addSecondaryActionButton(id, text, callback, zone = 'customActions'): void {
      if (!$(id)) (this as any).addActionButton(id, text, callback, zone, false, 'gray');
    }

    public addDangerActionButton(id, text, callback, zone = 'customActions'): void {
      if (!$(id)) (this as any).addActionButton(id, text, callback, zone, false, 'red');
    }
    
    public changePageTitle(suffix: string = null, save: boolean = false): void {
      if (suffix == null) {
        suffix = 'generic';
      }

      if (!this.gamedatas.gamestate['descriptionmyturn' + suffix]) {
        return;
      }

      if (save) {
        (this.gamedatas.gamestate as any).descriptionmyturngeneric = this.gamedatas.gamestate.descriptionmyturn;
        (this.gamedatas.gamestate as any).descriptiongeneric = this.gamedatas.gamestate.description;
      }

      this.gamedatas.gamestate.descriptionmyturn = this.gamedatas.gamestate['descriptionmyturn' + suffix];
      if (this.gamedatas.gamestate['description' + suffix])
        this.gamedatas.gamestate.description = this.gamedatas.gamestate['description' + suffix];
      (this as any).updatePageTitle();
    }

    private onEnteringInitialSelection(args: EnteringInitialSelectionArgs) {
        const cards = this.builderCardsManager.getFullCardsByIds(args._private.cards);
        this.getCurrentPlayerTable().setInitialSelection(cards);
    }

    private onEnteringCreate(args: EnteringCreateArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.createEngine = new CreateEngine(this, args._private.cards);
        }
    }

    private onEnteringArchive(args: EnteringArchiveArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.archiveEngine = new ArchiveEngine(this, args._private.cardIds);
        }
    }

    private onEnteringLearn(args: EnteringLearnArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.tableCenter.setTechnologyTilesSelectable(true, this.technologyTilesManager.getFullCardsByIds(args.techs));
        }
    }

    private onEnteringAddKnowledge(args: EnteringAddKnowledgeArgs, autoSelect: boolean) {
        if ((this as any).isCurrentPlayerActive()) {
            this.addKnowledgeSelection = {};
            Object.entries(args.cardIds).forEach(([pId, cardIds]) => {
                const timeline = this.getPlayerTable(Number(pId)).timeline;
                timeline.setSelectionMode('single', this.builderCardsManager.getFullCardsByIds(cardIds));
                if (autoSelect && cardIds.length == 1) {
                    timeline.selectCard(this.builderCardsManager.getFullCardById(cardIds[0]));
                }
            });
        }
    }

    private onEnteringRemoveKnowledge(args: EnteringRemoveKnowledgeArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.removeKnowledgeEngine = new RemoveKnowledgeEngine(this, args.cardIds, args.n, args.m, args.type);
        }
    }
  
    private onEnteringResolveChoice(args: EnteringResolveChoiceArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            Object.values(args.choices).forEach((choice) => this.addActionChoiceBtn(choice, false));
            Object.values(args.allChoices).forEach((choice) => this.addActionChoiceBtn(choice, true));

            const selectableCards = this.builderCardsManager.getFullCardsByIds(Object.values(args.choices).filter(choice => choice.args?.cardId).map(choice => choice.args.cardId));
            const playerTable = this.getCurrentPlayerTable();
            playerTable.timeline.setSelectionMode('single', selectableCards);
            playerTable.artifacts.setSelectionMode('single', selectableCards);
        }
    }
  
    private onEnteringSwap(args: EnteringSwapArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.getCurrentPlayerTable().enterSwap(args.cardIds, args.card_id);
        }
    }
  
    private onEnteringExcavate(args: EnteringSwapArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.getCurrentPlayerTable().past.setOpened(true);
            this.getCurrentPlayerTable().past.setSelectionMode('multiple', this.builderCardsManager.getFullCardsByIds(args.cardIds));
        }
    }
  
    private onEnteringDrawAndKeep(args: EnteringDrawAndKeepArgs) {
        const currentPlayer = (this as any).isCurrentPlayerActive();
        
        const cards = args._private?.cardIds ? this.builderCardsManager.getFullCardsByIds(args._private?.cardIds ?? []) : Array.from(Array(args.n)).map((_, index) => ({ id: `${-index}` } as BuilderCard));
        const pickDiv = document.getElementById('draw-and-keep-pick');
        pickDiv.innerHTML = '';
        pickDiv.dataset.visible = 'true';

        if (!this.drawAndPeekStock) {
            this.drawAndPeekStock = new LineStock<BuilderCard>(this.builderCardsManager, pickDiv);
            this.drawAndPeekStock.onSelectionChange = selection => {                
                const m = this.gamedatas.gamestate.args.m;
                document.getElementById('actDrawAndKeep_button')?.classList.toggle('disabled', selection.length != m);
            };
        }

        cards.forEach(card => {
            this.drawAndPeekStock.addCard(card);
        });
        if (currentPlayer) {
            this.drawAndPeekStock.setSelectionMode('multiple');
        }
    }
  
    private onEnteringMoveBuilding(args: EnteringMoveBuildingArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.moveBuildingEngine = new MoveBuildingEngine(this, Object.values(args.cardIds), args.card_id, Object.values(args.slots));
        }
    }
    
    private onEnteringFlipTechTile() {
        if ((this as any).isCurrentPlayerActive()) {
            document.getElementById(`table-center`).classList.remove(`folded`);
            this.tableCenter.setTileStocksSelectable(true);
        }
    }

    private initMarketStock() {
        if (!this.market) {
            document.getElementById('table-center-and-market').insertAdjacentHTML('afterbegin', `
                <div id="market"></div>
            `);
            this.market = new LineStock<BuilderCard>(this.builderCardsManager, document.getElementById(`market`));
            this.market.onSelectionChange = selection => this.onMarketSelectionChange(selection);
        }
    }

    private removeMarketStock() {
        document.getElementById('market')?.remove();
        this.market = null;
    }
  
    private onEnteringSpecialEffect(args: EnteringSpecialEffectArgs) {
        if (args.automaticAction) {
            return;
        }

        if (args.descSuffix) {
            this.gamedatas.gamestate[`description${args.descSuffix}`] = args.description;
            this.gamedatas.gamestate[`descriptionmyturn${args.descSuffix}`] = args.description;
            this.changePageTitle(args.descSuffix);

            $('pagemaintitletext').insertAdjacentHTML(
                'beforeend',
                ` (<span class="title-log-card-name" id="tooltip-${this._last_tooltip_id}">${_(args.source)}</span>)`
            );
        }

        if ((this as any).isCurrentPlayerActive()) {
            switch (args.sourceId) {
                case 'T17_EarthquakeEngineering':
                    this.getCurrentPlayerTable().setHandSelectable('multiple', this.builderCardsManager.getFullCardsByIds(args._private.cardIds));
                    break;
                case 'T22_AncientGreek':
                    this.initMarketStock();
                    this.market.addCards(this.builderCardsManager.getFullCardsByIds(args._private.cardIds));
                    this.market.setSelectionMode('single', this.builderCardsManager.getFullCardsByIds(args._private.validCardIds));
                    break;
            }
        }
    }

    private onEnteringEndScore(fromReload: boolean = false) {
        const lastTurnBar = document.getElementById('last-round');
        if (lastTurnBar) {
            lastTurnBar.style.display = 'none';
        }

        document.getElementById('score').style.display = 'flex';

        const players = Object.values(this.gamedatas.players);
        players.forEach(player => {
            document.getElementById('scoretr').insertAdjacentHTML('beforeend', `<th class="player_name" style="color: #${player.color}">${player.name}</th>`);
        });        
    
        document.getElementById('score-table-body').innerHTML = [
            'past',
            'effects',
            'techs',
            'timeline',
            'knowledge',
            'total',
        ].map(field => `<tr class="score-${field}">${players.map(player => `<td id="score-${field}-${player.id}"></td>`).join('')}</tr>`).join('');

        if (fromReload) {
            players.map(player => Number(player.id)).forEach(playerId => this.addPlayerSummaryColumn(playerId, this.gamedatas.scores[playerId]));
        }
    }
    
    private addPlayerSummaryColumn(playerId: number, playerScore: PlayerScore): void {
        [
            'past',
            'effects',
            'techs',
            'timeline',
            'knowledge',
            'total',
        ].forEach(field => {
            const value = field == 'total' ? playerScore[field] : playerScore[field].total;
            document.getElementById(`score-${field}-${playerId}`).innerHTML = `${value}`;
        });
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        (this as any).removeActionButtons();
        document.getElementById('customActions').innerHTML = '';
        document.getElementById('restartAction').innerHTML = '';

        switch (stateName) {
            case 'initialSelection':
                this.onLeavingInitialSelection();
                break;
            case 'create':
                this.onLeavingCreate();
                break;
            case 'archive':
                this.onLeavingArchive();
                break;
            case 'learn':
                this.onLeavingLearn();
                break;
            case 'addKnowledge':
            case 'addKnowledgeFromBoard':
                this.onLeavingAddKnowledge();
                break;
            case 'removeKnowledge':
                this.onLeavingRemoveKnowledge();
                break;
            case 'swap':
                this.onLeavingSwap();
                break;
            case 'excavate':
                this.getCurrentPlayerTable().past.setOpened(false);
                this.getCurrentPlayerTable()?.past.setSelectionMode('none');
                break;
            case 'discard':
            case 'discardMulti':
                this.getCurrentPlayerTable()?.setHandSelectable('none');
                break;
            case 'drawAndKeep':
                this.onLeavingDrawAndKeep();
                break;
            case 'moveBuilding':
                this.onLeavingMoveBuilding();
                break;
            case 'resolveChoice':
                this.onLeavingResolveChoice();
                break;
            case 'flipTechTile':
                this.onLeavingFlipTechTile();
                break;
            case 'specialEffect':
                const specialEffectArgs = this.gamedatas.gamestate.args as EnteringSpecialEffectArgs;
                switch (specialEffectArgs.sourceId) {
                    case 'T22_AncientGreek':
                        this.removeMarketStock();
                        break;
                }
        }
    }

    private onLeavingInitialSelection() {
        this.getCurrentPlayerTable()?.endInitialSelection();
    }

    private onLeavingCreate() {
        this.createEngine?.leaveState();
        this.createEngine = null;
    }

    private onLeavingArchive() {
        this.archiveEngine?.leaveState();
        this.archiveEngine = null;
    }

    private onLeavingAddKnowledge() {
        this.playersTables.forEach(playerTable => playerTable.timeline.setSelectionMode('none'));
    }

    private onLeavingRemoveKnowledge() {
        this.removeKnowledgeEngine?.leaveState();
        this.removeKnowledgeEngine = null;
    }

    private onLeavingLearn() {
        this.tableCenter.setTechnologyTilesSelectable(false);
    }
  
    private onLeavingSwap() {
        this.getCurrentPlayerTable()?.leaveSwap();
    }

    private onLeavingDrawAndKeep() {
        const pickDiv = document.getElementById('draw-and-keep-pick');
        pickDiv.dataset.visible = 'false';
        this.drawAndPeekStock?.removeAll();
    }

    private onLeavingMoveBuilding() {
        this.moveBuildingEngine?.leaveState();
        this.moveBuildingEngine = null;
    }

    private onLeavingResolveChoice() {
        const playerTable = this.getCurrentPlayerTable();
        playerTable?.timeline.setSelectionMode('none');
        playerTable?.artifacts.setSelectionMode('none');
    }
    
    private onLeavingFlipTechTile() {
        this.tableCenter.setTileStocksSelectable(false);
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        
        if ((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                case 'initialSelection':
                    this.onEnteringInitialSelection(args);
                    (this as any).addActionButton(`actSelectCardsToDiscard_button`, _('Keep selected cards'), () => this.actSelectCardsToDiscard());
                    document.getElementById('actSelectCardsToDiscard_button').classList.add('disabled');
                    break;
                case 'chooseAction':
                    ACTIONS.map(action => this.getActionInformations(action)).forEach(actionInformations => {
                        (this as any).addActionButton(`actChooseAction_${actionInformations[0]}_button`, `<div class="action-icon ${actionInformations[0]}"></div> ${actionInformations[1]}`, () => this.takeAtomicAction('actChooseAction', [actionInformations[0]]));
                        this.setTooltip(`actChooseAction_${actionInformations[0]}_button`, actionInformations[2]);
                    });
                    const table = this.getCurrentPlayerTable();
                    if (!table.hand.getCards().length) {
                        document.getElementById('actChooseAction_create_button').classList.add('disabled');
                    }
                    if (!table.past.getCards().filter(card => !card.rotated).length) {
                        document.getElementById('actChooseAction_excavate_button').classList.add('disabled');
                    }
                    if (!table.hasKnowledgeOnTimeline()) {
                        document.getElementById('actChooseAction_archive_button').classList.add('disabled');
                    }
                    break;
                case 'swap':
                    (this as any).addActionButton(`actSwap_button`, _("Swap selected cards"), () => this.actSwap());
                    document.getElementById('actSwap_button').classList.add('disabled');
                    break;
                case 'excavate':
                    (this as any).addActionButton(`actExcavate_button`, _("Excavate selected cards"), () => this.actExcavate());
                    document.getElementById('actExcavate_button').classList.add('disabled');
                    break;
                case 'discard':
                case 'discardMulti':
                    const cardsIds = args._private?.cardIds;
                    const selectableCards = cardsIds?.map(id => this.builderCardsManager.getFullCardById(id));
                    this.getCurrentPlayerTable().setHandSelectable('multiple', selectableCards);
                    (this as any).addActionButton(`actDiscard_button`, _("Discard selected cards"), () => this.actDiscard(stateName == 'discardMulti'));
                    document.getElementById('actDiscard_button').classList.add('disabled');
                    break;
                case 'confirmTurn':
                    (this as any).addActionButton(`actConfirmTurn_button`, _("Confirm turn"), () => this.actConfirmTurn());
                    this.startActionTimer(`actConfirmTurn_button`);
                    break;
                case 'drawAndKeep':
                    (this as any).addActionButton(`actDrawAndKeep_button`, _("Keep selected card(s)"), () => this.actDrawAndKeep());
                    document.getElementById('actDrawAndKeep_button').classList.add('disabled');
                    break;
                case 'addKnowledge':
                    (this as any).addActionButton(`actAddKnowledge_button`, formatTextIcons(_("Add ${n} <LOST_KNOWLEDGE> to selected cards").replace('${n}', args.n), true), () => this.actAddKnowledge());
                    document.getElementById('actAddKnowledge_button').classList.add('disabled');
                    break;
                case 'addKnowledgeFromBoard':
                    (this as any).addActionButton(`actAddKnowledgeFromBoard_button`, formatTextIcons(_("Add ${n} <LOST_KNOWLEDGE> to selected cards").replace('${n}', args.n), true), () => this.actAddKnowledgeFromBoard());
                    document.getElementById('actAddKnowledgeFromBoard_button').classList.add('disabled');
                    break;
                case 'specialEffect':
                    const specialEffectArgs = args as EnteringSpecialEffectArgs;
                    if (!specialEffectArgs.automaticAction) {
                        switch (specialEffectArgs.sourceId) {
                            case 'T17_EarthquakeEngineering':
                                (this as any).addActionButton(`actDiscardAndDraw_button`, _("Discard selected cards"), () => this.actDiscardAndDraw());
                                break;
                            case 'T22_AncientGreek':
                                if (specialEffectArgs._private?.canCreate) {
                                    (this as any).addActionButton(`actPickAndDiscard_button`, _("Build selected artifact"), () => this.actPickAndDiscard());
                                    document.getElementById('actPickAndDiscard_button').classList.add('disabled');
                                } else {
                                    (this as any).addActionButton(`actPickAndDiscard_button`, _("Pass (you cannot build an artifact)"), () => this.actPickAndDiscard(null));
                                }
                                break;
                        }
                    }
                    break;
            }
        } else {
            switch (stateName) {
                case 'initialSelection':
                    (this as any).addActionButton(`actCancelSelection_button`, _('Cancel'), () => this.actCancelSelection(), null, null, 'gray');
                    break;
                case 'discardMulti':
                    this.getCurrentPlayerTable().setHandSelectable('none');
                    break;
            }
        }
    }

    private addActionChoiceBtn(choice: ResolveChoice, disabled = false) {
        if ($('btnChoice' + choice.id)) return;
  
        let desc = formatTextIcons(this.translate(choice.description));
        if (desc == '' && choice.args.cardId) {
            const card = this.builderCardsManager.getFullCardById(choice.args.cardId);
            desc = card.name;
        }
  
        // Add source if any
        let source = _(choice.source ?? '');
        if (choice.sourceId) {
          const card = this.builderCardsManager.getFullCardById(choice.sourceId);
          source = this.format_string_recursive('${card_name}', { i18n: ['card_name'], card_name: _(card.name), card_id: card.id });
        }
  
        if (source != '') {
          desc += ` (${source})`;
        }
  
        this.addSecondaryActionButton(
          'btnChoice' + choice.id,
          desc,
          disabled
            ? () => {}
            : () => {
                this.askConfirmation(choice.irreversibleAction, () => this.takeAction('actChooseAction', { id: choice.id }));
              }
        );
        if (disabled) {
          document.getElementById(`btnChoice${choice.id}`).classList.add('disabled');
        }
      }

      private translate(t: any | string) {
        if (typeof t === 'object') {
          return this.format_string_recursive(t.log, t.args);
        } else {
          return _(t);
        }
      }

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////

    public setTooltip(id: string, html: string) {
        (this as any).addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    }
    public setTooltipToClass(className: string, html: string) {
        (this as any).addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
    }

    public getPlayerId(): number {
        return Number((this as any).player_id);
    }

    public getPlayer(playerId: number): AncientKnowledgePlayer {
        return Object.values(this.gamedatas.players).find(player => Number(player.id) == playerId);
    }

    private getPlayerTable(playerId: number): PlayerTable {
        return this.playersTables.find(playerTable => playerTable.playerId === playerId);
    }

    public getCurrentPlayerTable(): PlayerTable | null {
        return this.playersTables.find(playerTable => playerTable.playerId === this.getPlayerId());
    }

    public getGameStateName(): string {
        return this.gamedatas.gamestate.name;
    }

    private setupPreferences() {
        // Extract the ID and value from the UI control
        const onchange = (e) => {
          var match = e.target.id.match(/^preference_[cf]ontrol_(\d+)$/);
          if (!match) {
            return;
          }
          var prefId = +match[1];
          var prefValue = +e.target.value;
          (this as any).prefs[prefId].value = prefValue;
        }
        
        // Call onPreferenceChange() when any value changes
        dojo.query(".preference_control").connect("onchange", onchange);
        
        // Call onPreferenceChange() now
        dojo.forEach(
          dojo.query("#ingame_menu_content .preference_control"),
          el => onchange({ target: el })
        );
    }

    private startActionTimer(buttonId: string, time: number = ACTION_TIMER_DURATION) {
        if (Number((this as any).prefs[103]?.value) !== 3) {
            return;
        }

        const button = document.getElementById(buttonId);
 
        const _actionTimerLabel = button.innerHTML;
        let _actionTimerSeconds = time;
        const actionTimerFunction = () => {
          const button = document.getElementById(buttonId);
          if (button == null || button.classList.contains('disabled')) {
            window.clearInterval(this.actionTimerId);
          } else if (_actionTimerSeconds-- > 1) {
            button.innerHTML = _actionTimerLabel + ' (' + _actionTimerSeconds + ')';
          } else {
            window.clearInterval(this.actionTimerId);
            button.click();
          }
        };
        actionTimerFunction();
        this.actionTimerId = window.setInterval(() => actionTimerFunction(), 1000);
    }

    private getOrderedPlayers(gamedatas: AncientKnowledgeGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.no - b.no);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }

    private createPlayerPanels(gamedatas: AncientKnowledgeGamedatas) {

        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);   

            document.getElementById(`player_score_${player.id}`).insertAdjacentHTML('beforebegin', `<div class="vp icon"></div>`);
            document.getElementById(`icon_point_${player.id}`).remove();

            let html = `<div class="counters">
                <div id="playerhand-counter-wrapper-${player.id}">
                    <div class="player-hand-card"></div> 
                    <span id="playerhand-counter-${player.id}"></span>
                </div>
            
                <div id="lost-knowledge-counter-wrapper-${player.id}">
                    <div class="lost-knowledge icon"></div>
                    <span id="lost-knowledge-counter-${player.id}"></span>
                </div>

                <div>${player.no == 1 ? `<div id="first-player"></div>` : ''}</div>
            </div>
            <div class="icons counters">`;
            
            html += ICONS_COUNTERS_TYPES.map(type => `
                <div id="${type}-counter-wrapper-${player.id}">
                    <div class="${type} icon"></div>
                    <span id="${type}-counter-${player.id}"></span>
                </div>
            `).join(''); //${type == 'artifact' ? '' : `<span class="timeline-counter">(<span id="${type}-timeline-counter-${player.id}"></span>)</span>`}
            html += `</div>`;

            dojo.place(html, `player_board_${player.id}`);

            const handCounter = new ebg.counter();
            handCounter.create(`playerhand-counter-${playerId}`);
            handCounter.setValue(player.handCount);
            this.handCounters[playerId] = handCounter;
            this.setTooltip(`playerhand-counter-wrapper-${player.id}`, _('Cards in hand'));

            this.lostKnowledgeCounters[playerId] = new ebg.counter();
            this.lostKnowledgeCounters[playerId].create(`lost-knowledge-counter-${playerId}`);
            this.lostKnowledgeCounters[playerId].setValue(player.lostKnowledge);
            this.setTooltip(`lost-knowledge-counter-wrapper-${player.id}`, _('Lost knowledge'));

            ICONS_COUNTERS_TYPES.forEach(type => {
                const artifact = type == 'artifact';

                this[`${type}Counters`][playerId] = new ebg.counter();
                this[`${type}Counters`][playerId].create(`${type}-counter-${playerId}`);
                this[`${type}Counters`][playerId].setValue(player.icons[artifact ? 'artefact' : type]);

                if (artifact) {
                    this.setTooltip(`${type}-counter-wrapper-${player.id}`, _('Artifact cards'));
                } else {
                    /*this[`${type}TimelineCounters`][playerId] = new ebg.counter();
                    this[`${type}TimelineCounters`][playerId].create(`${type}-timeline-counter-${playerId}`);
                    this[`${type}TimelineCounters`][playerId].setValue(player.icons[`${type}-timeline`]);*/

                    let typeName = '';
                    switch (type) {
                        case 'city': typeName = _('City'); break;
                        case 'megalith': typeName = _('Megalith'); break;
                        case 'pyramid': typeName = _('Pyramid'); break;
                    }

                    this.setTooltip(`${type}-counter-wrapper-${player.id}`, _('${type} cards in the past (${type} cards in the timeline)').replace(/\${type}/g, typeName));
                }
            });
        });
        
        this.setTooltip(`first-player`, _('First player'));
    }

    private createPlayerTables(gamedatas: AncientKnowledgeGamedatas) {
        const orderedPlayers = this.getOrderedPlayers(gamedatas);

        orderedPlayers.forEach(player => 
            this.createPlayerTable(gamedatas, Number(player.id))
        );
    }

    private createPlayerTable(gamedatas: AncientKnowledgeGamedatas, playerId: number) {
        const table = new PlayerTable(this, gamedatas.players[playerId]);
        this.playersTables.push(table);
    }

    private updateIcons(playerId: number, icons: PlayerIcons) {
        ICONS_COUNTERS_TYPES.forEach(type => {
            const artifact = type == 'artifact';
    
            this[`${type}Counters`][playerId].toValue(icons[artifact ? 'artefact' : type]);
    
            /*if (!artifact) {
                this[`${type}TimelineCounters`][playerId].toValue(icons[`${type}-timeline`]);
            }*/
        });
    }

    private getHelpHtml() {
        let html = `
        <div id="help-popin">
            <h1>${_("Icons")}</h2>
            TODO help p14
        </div>`;

        return html;
    }

    private getActionInformations(action: string) { // icon/code, name (label), description
        switch (action) {
            case 'create': return ['create', _('Create'), formatTextIcons(_("<strong>Play</strong> 1 <CITY>, <MEGALITH>, <PYRAMID> or <ARTIFACT> card."))];
            case 'learn': return ['learn', _('Learn'), formatTextIcons(_("<strong>Take</strong> 1 <ANCIENT>, <WRITING> or <SECRET> Technology card."))];
            case 'archive': return ['archive', _('Archive'), formatTextIcons(_("<strong>Discard</strong> 1 <KNOWLEDGE> from 1 any of your <i>monuments</i> for each card discarded."))];
            case 'excavate': return ['excavate', _('Excavate'), _("<strong>Draw</strong> 2 Builder cards for each card in your Past you rotate.")];
            case 'search': return ['search', _('Search'), _("<strong>Draw</strong> 1 Builder card.")];
        }
    }

    private getHelpActionsHtml() {
        let html = `
        <div id="help-action-popin">
            <h1>${_("Actions (any 2)")}</h1>
            ${ACTIONS.map(action => this.getActionInformations(action)).map((actionInformations, index) => 
                `<div class="action" data-index="${index}">
                <div class="name">${actionInformations[1]}</div>
                <div class="description">${actionInformations[2]}</div>
                </div>`
            ).join('')}
        </div>`;

        return html;
    }

    private getHelpTurnHtml() {
        let html = `
        <div id="help-turn-popin">
            <h1 class="overview">${_("TURN OVERVIEW")}</h1>
            <div class="phase a">
                <h1>${_("A. ACTION PHASE")}</h1>
                <div class="description">${_("Any 2 actions.")}</div>
            </div>
            <div class="phase b">
                <h1>${_("B. TIMELINE PHASE")}</h1>
                <div class="description">${_("Activate all your cards with the symbol <TIMELINE> in any order.").replace('<TIMELINE>', '<div class="timeline icon"></div>')}</div>
            </div>
            <div class="phase c">
                <h1>${_("C. DECLINE PHASE")}</h1>
                <div class="description">${_("Slide all the monuments in your Timeline to the left.")}</div>
            </div>
            <h1 class="end">${_("END OF THE GAME")}</h1>
        </div>`;

        return html;
    }
    
    public onTableTechnologyTileClick(tile: TechnologyTile, showWarning: boolean = true): void {
        if (this.gamedatas.gamestate.name == 'learn') {
            const warning = showWarning && (this.gamedatas.gamestate.args as EnteringLearnArgs).irreversibleIds.includes(tile.id);
            if (warning) {
                this.askConfirmation(_("the technology tiles will be refilled with new tiles"), () => this.onTableTechnologyTileClick(tile, false));
            } else {
                this.takeAtomicAction('actLearn', [
                    tile.id,
                ]);
            }
        }
    }

    public onTableTechnologyTileStockClick(number: number): void {
        this.takeAtomicAction('actFlipTechTile', [number]);
    }
    
    public onMarketSelectionChange(selection: BuilderCard[]): void {
        if (this.gamedatas.gamestate.name == 'specialEffect') {
            switch (this.gamedatas.gamestate.args.sourceId) {
                case 'T22_AncientGreek':
                    document.getElementById(`actPickAndDiscard_button`).classList.toggle('disabled', selection.length != 1);
                    break;
            }            
        }
    }
    
    public onHandCardSelectionChange(selection: BuilderCard[]): void {
        if (this.gamedatas.gamestate.name == 'initialSelection') {
            document.getElementById('actSelectCardsToDiscard_button').classList.toggle('disabled', selection.length != 6);
        } else if (this.gamedatas.gamestate.name == 'create') {
            this.createEngine?.cardSelectionChange(selection);
        } else if (this.gamedatas.gamestate.name == 'archive') {
            this.archiveEngine?.cardSelectionChange(selection);
        } else if (['discard', 'discardMulti'].includes(this.gamedatas.gamestate.name)) {
            const n = Math.min(this.gamedatas.gamestate.args.n, this.getCurrentPlayerTable().hand.getCards().length);
            document.getElementById('actDiscard_button').classList.toggle('disabled', selection.length != n);
        } if (this.gamedatas.gamestate.name == 'specialEffect') {
            const args = this.gamedatas.gamestate.args as EnteringSpecialEffectArgs;
            switch (args.sourceId) {
                case 'T17_EarthquakeEngineering':
                    document.getElementById('actDiscardAndDraw_button').classList.toggle('disabled', selection.length > 3);
                    break;
            }
        }
    }

    public onTimelineCardSelectionChange(selection: BuilderCard[], playerId: number): void {
        if (this.gamedatas.gamestate.name == 'swap') {
            const length = selection.length + (this.gamedatas.gamestate.args.card_id ? 1 : 0);
            document.getElementById('actSwap_button').classList.toggle('disabled', length != 2);
        } else if (this.gamedatas.gamestate.name == 'moveBuilding') {
            if (selection.length == 1) {
                this.moveBuildingEngine.selectCard(selection[0]);
            }
        } else if (this.gamedatas.gamestate.name == 'resolveChoice') {
            if (selection.length == 1) {
                this.resolveChoiceCardClicked(selection[0]);
            }
        } else if (this.gamedatas.gamestate.name == 'addKnowledge') {
            if (selection.length <= 1) {
                this.addKnowledgeSelection[playerId] = selection[0]?.id;
            }
            const cardIdsPerPlayer = (this.gamedatas.gamestate.args as EnteringAddKnowledgeArgs).cardIds;
            const expectedNumber = Object.values(cardIdsPerPlayer).filter(cardIds => cardIds.length > 0).length;
            const currentNumber = Object.values(this.addKnowledgeSelection).filter(cardId => Boolean(cardId)).length;
            let valid = expectedNumber === currentNumber;
            if (valid) {
                Object.entries(this.addKnowledgeSelection).forEach(([pId, cardId]) => {
                    if (!cardIdsPerPlayer[pId]?.includes(cardId)) {
                        valid = false;
                    }
                });
            }
            document.getElementById('actAddKnowledge_button').classList.toggle('disabled', !valid);
        } else if (this.gamedatas.gamestate.name == 'addKnowledgeFromBoard') {
            Object.keys(this.addKnowledgeSelection).forEach((pId) => {
                const timeline = this.getPlayerTable(Number(pId)).timeline;
                timeline.unselectCard(this.builderCardsManager.getFullCardById(this.addKnowledgeSelection[pId]), true);
            });
            this.addKnowledgeSelection = {};

            if (selection.length <= 1) {
                this.addKnowledgeSelection[playerId] = selection[0]?.id;
            }
            let valid = Boolean(this.addKnowledgeSelection[playerId]);
            if (valid) {
                const cardIdsPerPlayer = (this.gamedatas.gamestate.args as EnteringAddKnowledgeArgs).cardIds;
                Object.entries(this.addKnowledgeSelection).forEach(([pId, cardId]) => {
                    if (!cardIdsPerPlayer[pId]?.includes(cardId)) {
                        valid = false;
                    }
                });
            }
            document.getElementById('actAddKnowledgeFromBoard_button').classList.toggle('disabled', !valid);
        }
    }

    public onPastCardSelectionChange(selection: BuilderCard[]): void {
        if (this.gamedatas.gamestate.name == 'excavate') {
            document.getElementById('actExcavate_button').classList.toggle('disabled', !selection.length);
        }
    }

    public onTimelineKnowledgeClick(id: string, selectionLength: number): void {
        if (this.gamedatas.gamestate.name == 'removeKnowledge') {
            this.removeKnowledgeEngine?.cardTokenSelectionChange(id, selectionLength);
        }
    }
    
    public onTimelineSlotClick(slotId: string): void {
        if (this.gamedatas.gamestate.name == 'create') {
            this.createEngine?.selectSlot(slotId);
        } else if (this.gamedatas.gamestate.name == 'moveBuilding') {
            this.takeAtomicAction('actMoveBuilding', [
                this.moveBuildingEngine.data.selectedCard.id,
                slotId,
            ]);
        }
    }
    
    public onArtifactCardClick(card: BuilderCard): void {
        if (this.gamedatas.gamestate.name == 'resolveChoice') {
            this.resolveChoiceCardClicked(card);
        }
    }

    public resolveChoiceCardClicked(card: BuilderCard): void {
        const choice = Object.values((this.gamedatas.gamestate.args as EnteringResolveChoiceArgs).choices).find(choice => choice.args?.cardId == card.id);
        if (choice) {
            this.askConfirmation(choice.irreversibleAction, () => this.takeAction('actChooseAction', { id: choice.id }));
        }
    }

    public onCreateCardConfirm(data: CreateEngineData): void {
        this.takeAtomicAction('actCreate', [
            data.selectedCard.id,
            data.selectedSlot,
            data.discardCards.map(card => card.id).sort(),
        ]);
    }

    public onArchiveCardConfirm(data: ArchiveEngineData): void {
        this.takeAtomicAction('actArchive', [
            data.discardCards.map(card => card.id).sort(),
        ]);
    }
    
    public onRemoveKnowledgeConfirm(discardTokens: { [cardId: string]: number; }): void {
        this.takeAtomicAction('actRemoveKnowledge', [discardTokens]);
    }

    public onTableCardClick(card: BuilderCard): void {
        /*if (this.gamedatas.gamestate.name == 'discardTableCard') {
            this.discardTableCard(card.id);
        } else {
            this.chooseNewCard(card.id);
        }*/
    }

    public onPlayedCardClick(card: BuilderCard): void {
        /*if (this.gamedatas.gamestate.name == 'discardCard') {
            this.discardCard(card.id);
        } else {
            this.setPayDestinationLabelAndState();
        }*/
    }
  	
    public actSwap() {
        const selectedCards = this.getCurrentPlayerTable().timeline.getSelection();
        const cardsIds = selectedCards.map(card => card.id).sort();
        const forcedCardId = (this.gamedatas.gamestate.args as EnteringSwapArgs).card_id;
        if (forcedCardId) {
            cardsIds.unshift(forcedCardId);
        }

        this.takeAtomicAction('actSwap', cardsIds);
    }
  	
    public actAddKnowledge() {
        const addKnowledgeSelection = this.addKnowledgeSelection;
        Object.keys(addKnowledgeSelection).forEach(key => {
            if (!addKnowledgeSelection[key]) {
                delete addKnowledgeSelection[key];
            }
        })
        this.takeAtomicAction('actAddKnowledge', [this.addKnowledgeSelection])
    }
  	
    public actAddKnowledgeFromBoard() {
        this.takeAtomicAction('actAddKnowledgeFromBoard', [Object.values(this.addKnowledgeSelection)[0]]);
    }
  	
    public actExcavate() {
        const selectedCards = this.getCurrentPlayerTable().past.getSelection();
        const cardsIds = selectedCards.map(card => card.id).sort();

        this.takeAtomicAction('actExcavate', [cardsIds], true);
    }
  	
    public actDiscard(multi: boolean) {
        const selectedCards = this.getCurrentPlayerTable().hand.getSelection();
        const cardsIds = selectedCards.map(card => card.id).sort();

        this.takeAtomicAction(multi ? 'actDiscardMulti' : 'actDiscard', [cardsIds]);
    }
  	
    public actDiscardAndDraw() {
        const selectedCards = this.getCurrentPlayerTable().hand.getSelection();
        const cardsIds = selectedCards.map(card => card.id).sort();

        this.takeAtomicAction('actDiscardAndDraw', [cardsIds]);
    }
  	
    public actDrawAndKeep() {
        const selectedCards = this.drawAndPeekStock.getSelection();
        const cardsIds = selectedCards.map(card => card.id).sort();

        this.takeAtomicAction('actDrawAndKeep', cardsIds);
    }
  	
    public actPickAndDiscard(pass: boolean = false) {
        const selectedCards = this.market.getSelection();
        this.takeAtomicAction('actPickAndDiscard', [pass ? null : selectedCards[0]?.id]);
    }
  	
    public actSelectCardsToDiscard() {
        if(!(this as any).checkAction('actSelectCardsToDiscard')) {
            return;
        }

        const selectedCards = this.getCurrentPlayerTable().hand.getSelection();
        const discardCards = this.getCurrentPlayerTable().hand.getCards().filter(card => !selectedCards.some(sc => sc.id == card.id));
        const cardsIds = discardCards.map(card => card.id).sort();

        this.takeAction('actSelectCardsToDiscard', {
            cardIds: JSON.stringify(cardsIds),
        });
    }
  	
    public actCancelSelection() {
        this.takeAction('actCancelSelection');
    }
  	
    public actConfirmTurn() {
        if(!(this as any).checkAction('actConfirmTurn')) {
            return;
        }

        this.takeAction('actConfirmTurn');
    }
  	
    public actConfirmPartialTurn() {
        if(!(this as any).checkAction('actConfirmPartialTurn')) {
            return;
        }

        this.takeAction('actConfirmPartialTurn');
    }
  	
    public actRestart() {
        if(!(this as any).checkAction('actRestart')) {
            return;
        }

        this.takeAction('actRestart');
    }

    private askConfirmation(warning: boolean | string, callback: Function) {
        if (warning === false /*|| this.prefs[104].value == 0*/) {
          callback();
        } else {
            let msg = warning === true ?
                _("you will either draw card(s) from the deck or the discard, or someone else is going to make a choice") :
                warning;

            (this as any).confirmationDialog(
                this.format_string_recursive(_("If you take this action, you won't be able to undo past this step because of the following reason: ${msg}"), { msg }),
                () => callback()
            );
        }
    }

    private takeAtomicAction(action: string, args: any = {}, warning: boolean | string = false) {
        if (!(this as any).checkAction(action)) return false;
  
        this.askConfirmation(warning, () =>
          this.takeAction('actTakeAtomicAction', { actionName: action, actionArgs: JSON.stringify(args) }/*, false*/)
        );
    }

    public takeAction(action: string, data?: any) {
        data = data || {};
        data.lock = true;
        (this as any).ajaxcall(`/ancientknowledge/ancientknowledge/${action}.html`, data, this, () => {});
    }

    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    setupNotifications() {
        //log( 'notifications subscriptions setup' );

        dojo.connect((this as any).notifqueue, 'addToLog', () => {
            this.addLogClass();
        });

        const notifs = [
            ['drawCards', ANIMATION_MS],
            ['pDrawCards', ANIMATION_MS],
            ['discardCards', ANIMATION_MS],
            ['pDiscardCards', ANIMATION_MS],
            ['destroyCard', ANIMATION_MS],
            ['createCard', undefined],
            ['fillPool', undefined],
            ['discardLostKnowledge', 1],
            ['learnTech', undefined],
            ['clearTurn', 1],
            ['refreshUI', 1],
            ['refreshHand', 1],
            ['declineCard', undefined],
            ['declineSlideLeft', undefined],
            ['addKnowledge', ANIMATION_MS],
            ['addKnowledgeFromBoard', ANIMATION_MS],
            ['removeKnowledge', ANIMATION_MS],
            ['clearTechBoard', ANIMATION_MS],
            ['midGameReached', ANIMATION_MS],
            ['fillUpTechBoard', ANIMATION_MS],
            ['swapCards', ANIMATION_MS],
            ['rotateCards', ANIMATION_MS],
            ['straightenCards', ANIMATION_MS],
            ['keepAndDiscard', ANIMATION_MS],
            ['moveCard', undefined],
            ['mediumMessage', 1000],
            ['endOfGameTriggered', 1],
            ['scoringEntry', SCORE_ANIMATION_MS],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, (notifDetails: Notif<any>) => {
                log(`notif_${notif[0]}`, notifDetails.args);

                const promise = this[`notif_${notif[0]}`](notifDetails.args);

                if (notifDetails.args.player_id && notifDetails.args.icons) {
                    this.updateIcons(notifDetails.args.player_id, notifDetails.args.icons);
                }

                const promises = [];
                if (!isNaN(notif[1] as number)) {
                    promises.push(sleep(notif[1] as number));
                }
                if (promise) {
                    promises.push(promise);
                }
                let minDuration = 1;
                // tell the UI notification ends, if the function returned a promise
                promise?.then(() => (this as any).notifqueue.onSynchronousNotificationEnd());

                let msg = this.format_string_recursive(notifDetails.log, notifDetails.args);
                if (msg != '') {
                    $('gameaction_status').innerHTML = msg;
                    $('pagemaintitletext').innerHTML = msg;
                    $('generalactions').innerHTML = '';

                    // If there is some text, we let the message some time, to be read 
                    minDuration = MIN_NOTIFICATION_MS;
                }

                // tell the UI notification ends, if the function returned a promise. 
                if (this.animationManager.animationsActive()) {
                    Promise.all([...promises, sleep(minDuration)]).then(() => (this as any).notifqueue.onSynchronousNotificationEnd());
                } else {
                    (this as any).notifqueue.setSynchronousDuration(0);
                }
            });
            (this as any).notifqueue.setSynchronous(notif[0], undefined);
        });

        if (isDebug) {
            notifs.forEach((notif) => {
                if (!this[`notif_${notif[0]}`]) {
                    console.warn(`notif_${notif[0]} function is not declared, but listed in setupNotifications`);
                }
            });

            Object.getOwnPropertyNames(AncientKnowledge.prototype).filter(item => item.startsWith('notif_')).map(item => item.slice(6)).forEach(item => {
                if (!notifs.some(notif => notif[0] == item)) {
                    console.warn(`notif_${item} function is declared, but not listed in setupNotifications`);
                }
            });
        }

        (this as any).notifqueue.setIgnoreNotificationCheck('drawCards', (notif: Notif<any>) => 
            notif.args.player_id == this.getPlayerId()
        );
        (this as any).notifqueue.setIgnoreNotificationCheck('discardCards', (notif: Notif<any>) => 
            notif.args.player_id == this.getPlayerId()
        );
        (this as any).notifqueue.setIgnoreNotificationCheck('keepAndDiscard', (notif: Notif<NotifKeepAndDiscardArgs>) => 
            notif.args.player_id == this.getPlayerId() && !notif.args.card
        );
    }

    notif_drawCards(args: NotifPDrawCardsArgs) {
        const { player_id, n } = args;    
        this.handCounters[player_id].incValue(Number(n));  
    }

    notif_pDrawCards(args: NotifPDrawCardsArgs) {
        const { player_id, cards } = args;        
        this.handCounters[player_id].incValue(cards.length);
        return this.getPlayerTable(args.player_id).hand.addCards(this.builderCardsManager.getFullCards(args.cards));
    }

    notif_discardCards(args: NotifPDrawCardsArgs) {
        const { player_id, n } = args;    
        this.handCounters[player_id].incValue(-Number(n));  
    }

    notif_pDiscardCards(args: NotifPDiscardCardsArgs) {
        const { player_id, cards } = args;    
        this.handCounters[player_id].incValue(-cards.length);    
        this.getPlayerTable(player_id).hand.removeCards(cards);
        return Promise.resolve(true);
    }

    notif_destroyCard(args: NotifDestroyCardArgs) {
        const { player_id, card } = args;      
        this.getPlayerTable(player_id).timeline.removeCard(card);
        return Promise.resolve(true);
    }

    notif_createCard(args: NotifCreateCardsArgs) {
        const { player_id, card } = args;    
        if (card.id[0] == 'T') {
            const tile = this.technologyTilesManager.getFullCard(card as TechnologyTile);
            return this.getPlayerTable(player_id).addTechnologyTile(tile);
        } else {
            this.handCounters[player_id].incValue(-1);   
            const fullCard = this.builderCardsManager.getFullCard(card as BuilderCard);
            return this.getPlayerTable(player_id).createCard(fullCard);
        }
    }

    notif_fillPool(args: NotifFillPoolArgs) {
        const tiles = Object.values(args.cards);
        const promises = [1, 2, 3].map(number => {
            const numberTilesId = tiles.filter(tile => tile.location == `board_${number}`).map(tile => tile.id);
            const numberTiles = this.technologyTilesManager.getFullCardsByIds(numberTilesId);
            return this.tableCenter.technologyTilesStocks[number].addCards(numberTiles);
        });
        return Promise.all(promises);
    }

    private updatePlayerLostCounter(playerId: number) {
        const playerCounter = document.getElementById(`player-table-${playerId}-lost-knowledge-counter`);
        const value = this.lostKnowledgeCounters[playerId].getValue();
        playerCounter.innerHTML = `${value}`;
        playerCounter.dataset.empty = (!value).toString();
    }

    notif_discardLostKnowledge(args: NotifDiscardLostKnowledgeArgs) {
        const { player_id, n } = args;
        this.lostKnowledgeCounters[player_id].incValue(-n);
        this.updatePlayerLostCounter(player_id);
        this.getPlayerTable(player_id).incLostKnowledge(-n);
    }

    notif_learnTech(args: NotifLearnTechArgs) {
        return this.getPlayerTable(args.player_id).addTechnologyTile(args.card);
    }
    
    notif_clearTurn(args: NotifClearTurnArgs) {
      this.cancelLogs(args.notifIds);
    }
    
    notif_refreshUI(args: NotifRefreshUIArgs) {
        Object.entries(args.datas.players).forEach(entry => {
            const playerId = Number(entry[0]);
            const player = entry[1];
            this.getPlayerTable(playerId).refreshUI(player);
            this.handCounters[playerId].setValue(player.handCount);
            this.lostKnowledgeCounters[playerId].setValue(player.lostKnowledge);
            this.updatePlayerLostCounter(playerId);
            this.updateIcons(playerId, player.icons);
        });
        this.tableCenter.refreshTechnologyTiles(args.datas.techs);
        [1, 2].forEach(level => {
            this.tableCenter.technologyTilesDecks[level].setCardNumber(args.datas[`techsDeckLvl${level}`]);
        });

        const lastRoundDiv = document.getElementById(`last-round`);
        if (lastRoundDiv && !args.datas.endOfGameTriggered) {
            lastRoundDiv?.remove();
        }
    }
    
    notif_refreshHand(args: NotifRefreshHandArgs) {
        const { player_id, hand } = args;
        this.handCounters[player_id].setValue(hand.length);
        return this.getPlayerTable(player_id).refreshHand(hand);
    }  

    notif_declineCard(args: NotifDeclineCardArgs) {
        const { player_id, card, n } = args;
        this.lostKnowledgeCounters[player_id].incValue(n);
        this.updatePlayerLostCounter(player_id);
        return this.getPlayerTable(player_id).declineCard(card, n);
    }  

    notif_declineSlideLeft(args: NotifDeclineCardArgs) {
        return this.getPlayerTable(args.player_id).declineSlideLeft();
    }
    
    notif_addKnowledge(args: NotifAddKnowledgeArgs) {
        Object.values(args.cards).forEach(card => this.playersTables.find(playerTable => playerTable.timeline.getCards().some(c => c.id == card.id)).setCardKnowledge(card.id, card.knowledge));
    }
    
    notif_addKnowledgeFromBoard(args: NotifAddKnowledgeFromBoardArgs) {
        const { card, player_id, n } = args;
        this.playersTables.find(playerTable => playerTable.timeline.getCards().some(c => c.id == card.id)).setCardKnowledge(card.id, card.knowledge);

        this.getPlayerTable(player_id).incLostKnowledge(-n);
        this.lostKnowledgeCounters[player_id].incValue(-n);
        this.updatePlayerLostCounter(player_id);
    }
    
    notif_removeKnowledge(args: NotifRemoveKnowledgeArgs) {
        const table = this.getPlayerTable(args.player_id);
        Object.values(args.cards).forEach(card => table.setCardKnowledge(card.id, card.knowledge));
    }
    
    notif_clearTechBoard(args: NotifTechBoardArgs) {
        return this.tableCenter.clearTechBoard(args.board, args.cards);
    }

    notif_midGameReached(args: NotifMidGameReachedArgs) {
        return this.notif_clearTechBoard(args).then(() => this.tableCenter.midGameReached(args.board));
    }
    
    notif_fillUpTechBoard(args: NotifTechBoardArgs) {
        return this.tableCenter.fillUpTechBoard(args.board, args.cards, args);
    }
    
    notif_swapCards(args: NotifSwapCardsArgs) {
        return this.getPlayerTable(args.player_id).swapCards(this.builderCardsManager.getFullCards([args.card, args.card2]));
    }
    
    notif_rotateCards(args: NotifRotateCardsArgs) {
        return this.getPlayerTable(args.player_id).rotateCards(this.builderCardsManager.getFullCards(args.cards));
    } 
    
    notif_straightenCards(args: NotifRotateCardsArgs) {
        return this.getPlayerTable(args.player_id).rotateCards(this.builderCardsManager.getFullCards(args.cards));
    }
    
    notif_keepAndDiscard(args: NotifKeepAndDiscardArgs) {
        const { player_id, card } = args;
        this.handCounters[player_id].incValue(1);
        return card ?
            this.getPlayerTable(player_id).hand.addCard(this.builderCardsManager.getFullCard(card)) :
            Promise.resolve(true);
    }
    
    async notif_moveCard(args: NotifMoveCardArgs) {
        const { player_id, card } = args;
        const playerTable = this.getPlayerTable(player_id);
        const newStock = card.location == 'past' ? playerTable.past : playerTable.timeline;
        await newStock.addCard(this.builderCardsManager.getFullCard(card));
        
        if (card.location == 'past') {
            playerTable.past.resetPastOrder();
        }
    }
    
    notif_mediumMessage() {}    
    
    notif_endOfGameTriggered(animate: boolean = true) {
        dojo.place(`<div id="last-round">
            <span class="last-round-text ${animate ? 'animate' : ''}">${_("This is the final round!")}</span>
        </div>`, 'page-title');
    }
    
    notif_scoringEntry(args: NotifScoringEntryArgs) {
        if (!document.getElementById('scoretr').childElementCount) {
            this.onEnteringEndScore();
        }

        document.getElementById(`score-${args.category}-${args.player_id}`).innerHTML = `${args.n}`;
    }
    
    
    /*
    * [Undocumented] Called by BGA framework on any notification message
    * Handle cancelling log messages for restart turn
    */
    /* @Override */
    public onPlaceLogOnChannel(msg) {
     var currentLogId = (this as any).notifqueue.next_log_id;
     var currentMobileLogId = (this as any).next_log_id;
     var res = (this as any).inherited(arguments);
     (this as any)._notif_uid_to_log_id[msg.uid] = currentLogId;
     (this as any)._notif_uid_to_mobile_log_id[msg.uid] = currentMobileLogId;
     (this as any)._last_notif = {
       logId: currentLogId,
       mobileLogId: currentMobileLogId,
       msg,
     };
     return res;
    }
    
    private cancelLogs(notifIds: string[]) {
      notifIds.forEach((uid) => {
        if ((this as any)._notif_uid_to_log_id.hasOwnProperty(uid)) {
          let logId = (this as any)._notif_uid_to_log_id[uid];
          if ($('log_' + logId)) {
            dojo.addClass('log_' + logId, 'cancel');
          }
        }
        if ((this as any)._notif_uid_to_mobile_log_id.hasOwnProperty(uid)) {
          let mobileLogId = (this as any)._notif_uid_to_mobile_log_id[uid];
          if ($('dockedlog_' + mobileLogId)) {
            dojo.addClass('dockedlog_' + mobileLogId, 'cancel');
          }
        }
      });
    }
    
    addLogClass() {
      if ((this as any)._last_notif == null) {
        return;
      }

      let notif = (this as any)._last_notif;
      let type = notif.msg.type;
      if (type == 'history_history') {
        type = notif.msg.args.originalType;
      }

      if ($('log_' + notif.logId)) {
        dojo.addClass('log_' + notif.logId, 'notif_' + type);

        var methodName = 'onAdding' + type.charAt(0).toUpperCase() + type.slice(1) + 'ToLog';
        this[methodName]?.(notif);
      }
      if ($('dockedlog_' + notif.mobileLogId)) {
        dojo.addClass('dockedlog_' + notif.mobileLogId, 'notif_' + type);
      }

      while (this.tooltipsToMap.length) {
        const tooltipToMap = this.tooltipsToMap.pop();
        if (!tooltipToMap || !tooltipToMap[1]) {
            console.error('erreur tooltipToMap', tooltipToMap);
        } else {
            const tooltip = tooltipToMap[1][0] == 'T' ?
                this.technologyTilesManager.getTooltip(this.technologyTilesManager.getFullCardById(tooltipToMap[1])) :
                this.builderCardsManager.getTooltip(this.builderCardsManager.getFullCardById(tooltipToMap[1]));
            this.setTooltip(`tooltip-${tooltipToMap[0]}`, tooltip);
        }
      }
    }

    private onClick(elem: HTMLElement, callback) {
        elem.addEventListener('click', callback);
    }

    protected onAddingNewUndoableStepToLog(notif) {
      if (!$(`log_${notif.logId}`)) {
        return;
      }
      let stepId = notif.msg.args.stepId;
      $(`log_${notif.logId}`).dataset.step = stepId;
      if ($(`dockedlog_${notif.mobileLogId}`)) {
        $(`dockedlog_${notif.mobileLogId}`).dataset.step = stepId;
      }

      if (this.gamedatas?.gamestate?.args?.previousSteps?.includes(parseInt(stepId))) {
        this.onClick($(`log_${notif.logId}`), () => this.undoToStep(stepId));

        if ($(`dockedlog_${notif.mobileLogId}`)) {
            this.onClick($(`dockedlog_${notif.mobileLogId}`), () => this.undoToStep(stepId));
        }
      }
    }    
    
    undoToStep(stepId: number) {
      this.stopActionTimer();
      (this as any).checkAction('actRestart');
      this.takeAction('actUndoToStep', { stepId }/*, false*/);
    }

    stopActionTimer() {
        window.clearInterval(this.actionTimerId);
    }

    public getGain(type: number): string {
        switch (type) {
            case 1: return _("Victory Point");
            case 2: return _("Bracelet");
            case 3: return _("Recruit");
            case 4: return _("Reputation");
            case 5: return _("Card");
        }
    }

    public getTooltipActivation(activation: string): string {
        switch (activation) {
            case 'anytime': return _("Ongoing (with conditions)");
            case 'decline': return _("Decline Phase");
            case 'immediate': return _("Immediate");
            case 'timeline': return _("Timeline Phase");
            case 'endgame': return _("Final Scoring");
        }
    }

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                if (args.card_name && args.card_name[0] != '<') {
                    this.tooltipsToMap.push([this._last_tooltip_id, args.card_id]);
                    args.card_name = `<strong id="tooltip-${this._last_tooltip_id}">${_(args.card_name)}</strong>`;
                    this._last_tooltip_id++;
                }

                log = formatTextIcons(_(log));
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}
