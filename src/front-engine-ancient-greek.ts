class AncientGreekEngineData {
    constructor(
        public selectedCard: BuilderCard = null,
        public discardCards: BuilderCard[] = [],
    ) {}
}

class AncientGreekEngine extends FrontEngine<AncientGreekEngineData> {
    public data: AncientGreekEngineData = new AncientGreekEngineData();

    constructor (public game: AncientKnowledgeGame, public validCards: { [cardId: string]: number }, public canCreate: boolean) {
        super(game, [
            new FrontState<AncientGreekEngineData>(
                'init',
                engine => {
                    this.game.changePageTitle(null);
                    if (engine.data.selectedCard) {
                        this.game.builderCardsManager.getCardElement(engine.data.selectedCard)?.classList.remove('created-card');
                        this.game.market.addCard(engine.data.selectedCard);
                    }
                    engine.data.selectedCard = null;
                    engine.data.discardCards = [];

                    const validCardIds = Object.keys(validCards);
                    this.game.market?.setSelectionMode('single', this.game.builderCardsManager.getFullCardsByIds(validCardIds));
                    this.addConfirmCardSelection();
                },
                () => {
                    this.game.market?.setSelectionMode('none');
                    this.removeConfirmCardSelection();
                }
            ),
            new FrontState<AncientGreekEngineData>(
                'discard',
                engine => {
                    const discardCount = this.getDiscardCount();
                    if (!discardCount) {
                        this.game.onAncientGreekConfirm(this.data);
                        return;
                    } 

                    (this.game as any).gamedatas.gamestate.args.discard_number = discardCount;
                    this.game.changePageTitle(`SelectDiscard`, true);
                    engine.data.discardCards = [];
                    this.game.getCurrentPlayerTable().setHandSelectable('multiple', null, 'create-discard', true);
                    this.addConfirmDiscardSelection();
                    this.addCancel();
                },
                engine => {
                    this.removeConfirmDiscardSelection();
                    this.game.getCurrentPlayerTable().setHandSelectable('none');
                    this.removeCancel();
                    engine.data.discardCards.forEach(card => this.game.builderCardsManager.getCardElement(card)?.classList.remove('discarded-card'));
                    this.game.builderCardsManager.getCardElement(engine.data.selectedCard)?.classList.remove('created-card');
                }
            ),
        ]);

        this.enterState('init');
    }
    
    public cardSelectionChange(selection: BuilderCard[]) {
        if (this.currentState == 'discard') {
            this.data.discardCards = selection;
            this.setConfirmDiscardSelectionState();
        }
    }

    public selectCard(card?: BuilderCard) {
        if (this.currentState !== 'init') {
            return;
        }

        this.data.selectedCard = card;

        this.setConfirmCardSelectionState();
    }

    private addConfirmCardSelection() { 
        if (this.canCreate) {
            this.game.addPrimaryActionButton(`actPickAndDiscard_button`, _("Build selected artifact"), () => {   
                this.nextState('discard');

                const card = this.data.selectedCard;             
                if (card) {
                    this.game.builderCardsManager.getCardElement(card)?.classList.add('created-card');
                    
                    const stock = this.game.getCurrentPlayerTable().artifacts;
                    const stockCards = stock.getCards();
                    const freeSlot = [0,1,2,3,4].map(i => `artefact-${i}`).find(slotId => !stockCards.some(card => card.location == slotId));

                    stock.addCard(this.data.selectedCard, undefined, {
                        slot: freeSlot,
                    });
                }
            });
            this.setConfirmCardSelectionState();
        } else {
            this.game.addPrimaryActionButton(`actPickAndDiscard_button`, `${_("Pass")} (${_("you cannot build an artifact")})`, () => this.game.onAncientGreekConfirm(null));
        }        
    }

    private removeConfirmCardSelection() {    
        document.getElementById('actPickAndDiscard_button')?.remove();
    }

    private setConfirmCardSelectionState() { 
        document.getElementById('actPickAndDiscard_button')?.classList.toggle('disabled', !this.data.selectedCard);
    }

    private addCancel() {    
        this.game.addSecondaryActionButton('restartCardCreation_btn', _('Restart card creation'), () => this.nextState('init'));
    }

    private removeCancel() {    
        document.getElementById('restartCardCreation_btn')?.remove();
    }

    private addConfirmDiscardSelection() {    
        this.game.addPrimaryActionButton('confirmDiscardSelection_btn', _('Confirm discarded cards'), () => this.game.onAncientGreekConfirm(this.data));
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

        return this.validCards[card.id];
    }
    
}