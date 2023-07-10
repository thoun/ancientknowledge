class RemoveKnowledgeEngineData {
    constructor(
        public discardTokens: {[cardId: string]: number} = {},
    ) {}
}

class RemoveKnowledgeEngine extends FrontEngine<RemoveKnowledgeEngineData> {
    public data: RemoveKnowledgeEngineData = new RemoveKnowledgeEngineData();

/*pour REMOVE_KNOWLEDGE, il faudra gérer plusieurs comportements en fonction du champs 'type'
je t'envoie une liste d'ids de carte, un entier n, et type qui est soit OR/XOR
XOR ça veut dire qu'il faut enlever $n knowledge d'exactement une carte parmis celles des args
OR c'est le cas "normal" où tu répartis les $n comme tu veux parmis les cartes des args
et pour actRemoveKnowleldge j'attends un tableau associatif : ['cardId' => n1, 'cardId2' => n2, ...]*/

    constructor (public game: AncientKnowledgeGame, private cardIds: string[], private n: number, private type: 'or' | 'xor') {
        super(game, [
            new FrontState<RemoveKnowledgeEngineData>(
                'discardTokens',
                engine => {
                    engine.data.discardTokens = {};
                    this.game.getCurrentPlayerTable().setTimelineTokensSelectable('multiple', this.cardIds);
                    this.addConfirmDiscardTokenSelection();
                    this.setConfirmDiscardTokenSelectionState();
                    //this.addCancel();
                },
                () => {
                    this.removeConfirmDiscardTokenSelection();
                    this.game.getCurrentPlayerTable().setTimelineTokensSelectable('none');
                    //this.removeCancel();
                }
            ),
            /*new FrontState<RemoveKnowledgeEngineData>(
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

        this.enterState('discardTokens');
    }
    
    public cardTokenSelectionChange(cardId: string, knowledge: number) {
        if (this.currentState == 'discardTokens') {
            this.data.discardTokens[cardId] = knowledge;

            if (this.type === 'xor') {
                const selectableCardsIds = knowledge > 0 ? [cardId] : this.cardIds;
                this.game.getCurrentPlayerTable().setTimelineTokensSelectable('multiple', selectableCardsIds);
            }

            this.setConfirmDiscardTokenSelectionState();
        }
    }

    /*private addCancel() {    
        this.game.addSecondaryActionButton('restartCardCreation_btn', _('Restart card creation'), () => this.nextState('init'));
    }

    private removeCancel() {    
        document.getElementById('restartCardCreation_btn')?.remove();
    }*/

    private addConfirmDiscardTokenSelection() {    
        this.game.addPrimaryActionButton('confirmDiscardTokenSelection_btn', _('Confirm discarded tokens'), () => this.game.onRemoveKnowledgeConfirm(this.data.discardTokens));
        this.setConfirmDiscardTokenSelectionState();
    }

    private removeConfirmDiscardTokenSelection() {    
        document.getElementById('confirmDiscardTokenSelection_btn')?.remove();
    }

    private setConfirmDiscardTokenSelectionState() { 
        const discardCount = Object.values(this.data.discardTokens).reduce((a, b) => a + b, 0);
        //console.log(discardCount, this.n, Object.keys(this.data.discardTokens), this.cardIds);
        document.getElementById('confirmDiscardTokenSelection_btn')?.classList.toggle('disabled', 
            discardCount != this.n || 
            (this.type === 'xor' && Object.keys(this.data.discardTokens).length > 1) ||
            Object.keys(this.data.discardTokens).some(cardId => !this.cardIds.includes(cardId))
        );
    }
    
}