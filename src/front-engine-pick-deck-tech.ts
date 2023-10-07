class PickDeckTechEngineData {
    constructor(
        public selectedTech: TechnologyTile | null = null,
        public selectedDiscard: TechnologyTile[] = [],
        public remainingToDiscard: TechnologyTile[] = [],
    ) {}
}

class PickDeckTechEngine extends FrontEngine<PickDeckTechEngineData> {
    public data: PickDeckTechEngineData = new PickDeckTechEngineData();

    private market?: LineStock<TechnologyTile>;

    constructor (public game: AncientKnowledgeGame, public techs: TechnologyTile[], public learnableTechs: TechnologyTile[]) {
        super(game, [
            new FrontState<PickDeckTechEngineData>(
                'init',
                engine => {
                    if (engine.data.selectedTech) {
                        this.game.technologyTilesManager.getCardElement(engine.data.selectedTech)?.classList.remove('created-card');
                        this.data.selectedTech = null;
                    }
                    engine.data.selectedDiscard = [];
                    this.game.changePageTitle(null);
                    this.initMarketStock();
                    this.market.addCards(techs);
                    this.market.setSelectionMode('single', learnableTechs);

                    if (!learnableTechs.length) {
                        this.game.addPrimaryActionButton('passTakeTechTile_btn', `${_("Pass")} (${_("you cannot build a technology tile")})`, () => this.nextState('discard'));
                    }
                },
                () => {
                    document.getElementById('passTakeTechTile_btn')?.remove();
                }
            ),
            new FrontState<PickDeckTechEngineData>(
                'discard',
                engine => {
                    this.game.changePageTitle(`OrderTechDiscard`, true);
                    this.addConfirmAndCancel();
                    engine.data.selectedDiscard = [];
                    engine.data.remainingToDiscard = engine.data.selectedTech ? techs.filter(lt => lt.id != engine.data.selectedTech.id) : techs;
                    this.market.setSelectionMode('single', engine.data.remainingToDiscard);                    
                },
                engine => {
                    if (engine.data.selectedTech) {
                        this.game.technologyTilesManager.getCardElement(engine.data.selectedTech)?.classList.remove('created-card');
                    }
                    engine.data.selectedDiscard.forEach(card => this.setTechNumber(card, null));
                    this.market.setSelectionMode('none');
                    this.removeConfirmAndCancel();
                }
            ),
        ]);

        this.enterState('init');
    }

    private initMarketStock() {
        if (!this.market) {
            document.getElementById('table-center-and-market').insertAdjacentHTML('afterbegin', `
                <div id="market"></div>
            `);
            this.market = new LineStock<TechnologyTile>(this.game.technologyTilesManager, document.getElementById(`market`));
            this.market.onCardClick = card => this.onMarketClick(card);
        }
    }
    
    private onMarketClick(card: TechnologyTile): void {
        if (this.currentState === 'init') {
            if (this.learnableTechs.some(lt => lt.id == card.id)) {
                this.data.selectedTech = card;
                this.game.technologyTilesManager.getCardElement(card)?.classList.add('created-card');
                this.nextState('discard');
            }
        } else {
            if (this.data.remainingToDiscard.some(lt => lt.id == card.id)) {
                this.data.selectedDiscard.push(card);
                this.setTechNumber(card, this.data.selectedDiscard.length);
                const index = this.data.remainingToDiscard.indexOf(card);
                this.data.remainingToDiscard.splice(index, 1);
                this.market.setSelectionMode('single', this.data.remainingToDiscard);
                document.getElementById('confirmPikDeckTech_btn').classList.toggle('disabled', this.data.remainingToDiscard.length > 0);
            }
        }
    }
    
    private setTechNumber(card: TechnologyTile, number: number | null): void {
        if (!card?.id) {
            return;
        }

        const div = this.game.technologyTilesManager.getCardElement(card);
        if (!div) {
            return;
        }

        if (number !== null) {
            div.insertAdjacentHTML('beforeend', `<div class="pick-deck-tech-number">${number}</div>`);
        } else {
            div.querySelector('.pick-deck-tech-number')?.remove();
        }
    }

    private addConfirmAndCancel() {    
        this.game.addPrimaryActionButton('confirmPikDeckTech_btn', _('Put back in selected order'), () => this.game.onPickTechDeckConfirm(this.data.selectedTech?.id ?? null, this.data.selectedDiscard.map(card => card.id)));
        document.getElementById('confirmPikDeckTech_btn').classList.add('disabled');
        this.game.addSecondaryActionButton('restartPikDeckTech_btn', _('Restart'), () => this.nextState('init'));
    }

    private removeConfirmAndCancel() {    
        document.getElementById('confirmPikDeckTech_btn')?.remove();
        document.getElementById('restartPikDeckTech_btn')?.remove();
    }
    
    public remove() {
        this.market?.remove();
        this.market = null;
    }
    
}