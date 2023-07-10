class ArchiveEngineData {
    constructor(
        public discardCards: BuilderCard[] = [],
    ) {}
}

class ArchiveEngine extends FrontEngine<ArchiveEngineData> {
    public data: ArchiveEngineData = new ArchiveEngineData();

    constructor (public game: AncientKnowledgeGame, public possibleCards: string[]) {
        super(game, [
            new FrontState<ArchiveEngineData>(
                'discard',
                engine => {
                    engine.data.discardCards = [];
                    const cards = this.game.getCurrentPlayerTable().hand.getCards().filter(card => possibleCards.includes(card.id));
                    this.game.getCurrentPlayerTable().setHandSelectable('multiple', cards, 'archive-discard', true);
                    this.addConfirmDiscardSelection();
                    //this.addCancel();
                },
                () => {
                    this.removeConfirmDiscardSelection();
                    this.game.getCurrentPlayerTable().setHandSelectable('none');
                    //this.removeCancel();
                }
            )/*,
            new FrontState<ArchiveEngineData>(
                'confirm',
                engine => {
                    const discardCount = this.data.discardCards.length;
                    engine.data.discardCards.forEach(card => this.game.builderCardsManager.getCardElement(card)?.classList.add('discarded-card'));
                    this.game.changePageTitle(`Confirm`, true);

                    const label = formatTextIcons(_('Confirm discard of ${number} cards to remove ${number} <KNOWLEDGE>')).replace(/\${number}/g, ''+discardCount);

                    this.game.addPrimaryActionButton('confirmArchive_btn', label, () => this.game.onArchiveCardConfirm(engine.data));
                    this.addCancel();
                },
                engine => {
                    engine.data.discardCards.forEach(card => this.game.builderCardsManager.getCardElement(card)?.classList.remove('discarded-card'));
                    this.removeCancel();
                    document.getElementById('confirmArchive_btn')?.remove();
                }
            ),*/
        ]);

        this.enterState('discard');
    }
    
    public cardSelectionChange(selection: BuilderCard[]) {
        if (this.currentState == 'discard') {
            this.data.discardCards = selection;
            this.setConfirmDiscardSelectionState();
        }
    }

    /*private addCancel() {    
        this.game.addSecondaryActionButton('restartCardCreation_btn', _('Restart card creation'), () => this.nextState('init'));
    }

    private removeCancel() {    
        document.getElementById('restartCardCreation_btn')?.remove();
    }*/

    private addConfirmDiscardSelection() {    
        //this.game.addPrimaryActionButton('confirmDiscardSelection_btn', _('Confirm discarded cards'), () => this.nextState('discardTokens'));
        this.game.addPrimaryActionButton('confirmDiscardSelection_btn', _('Confirm discarded cards'), () =>  this.game.onArchiveCardConfirm(this.data));
        this.setConfirmDiscardSelectionState();
    }

    private removeConfirmDiscardSelection() {    
        document.getElementById('confirmDiscardSelection_btn')?.remove();
    }

    private setConfirmDiscardSelectionState() { 
        const discardCount = this.data.discardCards.length;
        document.getElementById('confirmDiscardSelection_btn')?.classList.toggle('disabled', discardCount == 0);
    }
    
}