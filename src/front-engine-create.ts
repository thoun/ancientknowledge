class CreateEngineData {
    constructor(
        public selectedCard: BuilderCard = null,
        public selectedSlot: string = null,
        public discardCards: BuilderCard[] = [],
    ) {}
}

class CreateEngine extends FrontEngine<CreateEngineData> {
    public data: CreateEngineData = new CreateEngineData();

    constructor (public game: AncientKnowledgeGame, public possibleCards: PossibleCardWithLocation[]) {
        super(game, [
            new FrontState<CreateEngineData>(
                'init',
                engine => {
                    this.game.changePageTitle(null);
                    if (engine.data.selectedCard) {
                        this.game.builderCardsManager.getCardElement(engine.data.selectedCard)?.classList.remove('created-card');
                        this.game.getCurrentPlayerTable().hand.addCard(engine.data.selectedCard);
                    }
                    engine.data.selectedCard = null;
                    engine.data.selectedSlot = null;
                    engine.data.discardCards = [];
                    this.game.getCurrentPlayerTable().setHandSelectable('single', 'create-init', true);
                },
                () => {
                    this.game.getCurrentPlayerTable().setHandSelectable('none');
                }
            ),
            new FrontState<CreateEngineData>(
                'slot',
                engine => {
                    const card = engine.data.selectedCard;

                    if (card.id[0] == 'A' || card.locked) {
                        this.data.selectedSlot = Object.keys(this.possibleCards[card.id])[0];

                        const stock = card.id[0] == 'A' ?
                            this.game.getCurrentPlayerTable().artifacts :
                            this.game.getCurrentPlayerTable().timeline;

                        stock.addCard(this.data.selectedCard, undefined, {
                            slot: this.data.selectedSlot,
                        });

                        engine.nextState('discard');
                        return;
                    }

                    this.game.changePageTitle(`SelectSlot`, true);
                    engine.data.selectedSlot = null;
                    engine.data.discardCards = [];
                    this.addCancel();
                    this.game.getCurrentPlayerTable().setTimelineSelectable(true, Object.keys(this.possibleCards[card.id]));
                },
                () => {
                    this.game.getCurrentPlayerTable().setTimelineSelectable(false);
                    this.removeCancel();
                }
            ),
            new FrontState<CreateEngineData>(
                'discard',
                engine => {
                    const discardCount = this.getDiscardCount();
                    if (!discardCount) {
                        this.nextState('confirm');
                        return;
                    } 

                    (this.game as any).gamedatas.gamestate.args.discard_number = discardCount;
                    this.game.changePageTitle(`SelectDiscard`, true);
                    engine.data.discardCards = [];
                    this.game.getCurrentPlayerTable().setHandSelectable('multiple', 'create-discard', true);
                    this.addConfirmDiscardSelection();
                    this.addCancel();
                },
                () => {
                    this.removeConfirmDiscardSelection();
                    this.game.getCurrentPlayerTable().setHandSelectable('none');
                    this.removeCancel();
                }
            ),
            new FrontState<CreateEngineData>(
                'confirm',
                engine => {
                    engine.data.discardCards.forEach(card => this.game.builderCardsManager.getCardElement(card)?.classList.add('discarded-card'));
                    this.game.changePageTitle(`Confirm`, true);

                    const card = engine.data.selectedCard;

                    const artifact = card.id[0] == 'A';
                    const discardedCardsCount = engine.data.discardCards.length;

                    let label = '';
                    if (artifact) {
                        label = _('Confirm creation of Artifact ${card_name}');
                    } else {
                        label = discardedCardsCount ? 
                            _('Confirm creation of Monument ${card_name} with ${number} discarded cards').replace('${number}', discardedCardsCount) : 
                            _('Confirm creation of Monument ${card_name}');
                    }
                    label = label.replace('${card_name}', card.name);

                    this.game.addPrimaryActionButton('confirmCreate_btn', label, () => this.game.onCreateCardConfirm(engine.data));
                    this.addCancel();
                },
                engine => {
                    engine.data.discardCards.forEach(card => this.game.builderCardsManager.getCardElement(card)?.classList.remove('discarded-card'));
                    this.removeCancel();
                    document.getElementById('confirmCreate_btn')?.remove();
                }
            ),
        ]);

        this.enterState('init');
    }
    
    public cardSelectionChange(selection: BuilderCard[]) {
        if (this.currentState == 'init') {
            if (selection.length == 1) {
                this.selectCard(selection[0]);
            }
        } else if (this.currentState == 'discard') {
            this.data.discardCards = selection;
            this.setConfirmDiscardSelectionState();
        }
    }

    public selectCard(card: BuilderCard) {
        this.data.selectedCard = card;
        this.game.builderCardsManager.getCardElement(card)?.classList.add('created-card');
        this.game.getCurrentPlayerTable().hand.unselectCard(card);
        this.nextState('slot');
    }

    public selectSlot(slotId: string) {
        this.data.selectedSlot = slotId;

        this.game.getCurrentPlayerTable().timeline.addCard(this.data.selectedCard, undefined, {
            slot: slotId,
        });
        this.nextState('discard');
    }

    private addCancel() {    
        this.game.addSecondaryActionButton('restartCardCreation_btn', _('Restart card creation'), () => this.nextState('init'));
    }

    private removeCancel() {    
        document.getElementById('restartCardCreation_btn')?.remove();
    }

    private addConfirmDiscardSelection() {    
        this.game.addPrimaryActionButton('confirmDiscardSelection_btn', _('Confirm discarded cards'), () => this.nextState('confirm'));
        this.setConfirmDiscardSelectionState();
    }

    private removeConfirmDiscardSelection() {    
        document.getElementById('confirmDiscardSelection_btn')?.remove();
    }

    private setConfirmDiscardSelectionState() { 
        const discardCount = this.getDiscardCount();
        document.getElementById('confirmDiscardSelection_btn')?.classList.toggle('disabled', discardCount != this.data.discardCards.length)
    }

    private getDiscardCount(): number {
        const card = this.data.selectedCard;
        if (!card) {
            return null;
        }

        const slot = card.id[0] == 'A' || card.locked ?
            Object.keys(this.possibleCards[card.id])[0] :
            this.data.selectedSlot;

        return this.possibleCards[card.id][slot];
    }
    
}