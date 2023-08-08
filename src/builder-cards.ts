interface BuilderCard {
    id: string;
    location: string;
    state;
    pId: number;

    number: number;
    name: string;
    text: string[];
    country: string;
    startingSpace: number;
    initialKnowledge: string;
    victoryPoint: string;
    discard: number;
    locked: boolean;
    activation: string;
    effect: string[];

    knowledge?: number;
    rotated?: number;
}

const CARD_COLORS = {
  'A': '#734073',
  'C': '#d66b2a',
  'M': '#4a82a3',
  'P': '#87a04f',
};

//console.log(Object.values(CARDS_DATA).map(card => card.startingSpace));

class BuilderCardsManager extends CardManager<BuilderCard> {
    constructor (public game: AncientKnowledgeGame) {
        super(game, {
            getId: (card) => `builder-card-${card.id}`,
            setupDiv: (card: BuilderCard, div: HTMLElement) => {
                div.classList.add('builder-card');
                div.dataset.cardId = ''+card.id;
                div.dataset.rotated = ''+card.rotated;
            },
            setupFrontDiv: (card: BuilderCard, div: HTMLElement) => this.setupFrontDiv(card, div),
            isCardVisible: card => Boolean(card.number),
            cardWidth: 163,
            cardHeight: 228,
            animationManager: game.animationManager,
        });
    }

    private setupFrontDiv(card: BuilderCard, div: HTMLElement, ignoreTooltip: boolean = false) { 
        if (div.style.getPropertyValue('--card-color')) {
            return;
        }

        const typeLetter = card.id.substring(0, 1);
        div.style.setProperty('--card-color', CARD_COLORS[typeLetter]);
        /*
        div.dataset.type = ''+card.type;
        div.dataset.number = ''+card.number;*/
        const backgroundPositionX = ((card.number - 1) % 6) * 100 / 5;
        const backgroundPositionY = Math.floor((card.number - 1) / 6) * 100 / 5;
        let html = `
        <div id="${card.id}-tokens" class="background" data-type="${typeLetter}" style="background-position: ${backgroundPositionX}% ${backgroundPositionY}%"></div>
        <div class="type-box" data-type="${typeLetter}">
            <div class="type" data-type="${typeLetter}">
                <div class="type-icon"></div>
            </div>
        `;

        if (card.startingSpace) {
            html += `<div class="starting-space">${card.startingSpace}</div>`;
        }
        html += `</div>`;

        // TODO TEMP
        html += `<div class="implemented" data-implemented="${card.implemented?.toString() ?? 'false'}"></div>`;

        if (card.discard || card.locked) {
            html += `
            <div class="discard">`;
            if (card.discard) {
                html += `
                    <div class="discard-text">${card.discard}</div>
                    <div class="discard-icon"></div>`;
            }
            if (card.locked) {
                html += `
                <div class="discard">
                    <div class="lock-icon"></div>
                </div>`;
            }
            html += `
            </div>`;
        }

        html += `
        <div class="center-box">
            <div class="activation-box"></div>
            <div class="line bottom"></div>
            <div class="line top"></div>
            <div class="line middle"></div>`;
        if (typeLetter != 'A') {
            html += `
            <div class="center-zone">
                <div class="initial-knowledge">${card.initialKnowledge ?? ''}</div>
                <div class="knowledge-icon"></div>
                <div class="victory-point">${card.victoryPoint ?? ''}</div>
                <div class="vp-icon"></div>
            </div>
            `;
        }
        html += `
            <div class="activation" data-type="${card.activation}"></div>
        </div>
        <div class="name-box">
            <div class="name">
                ${card.name ?? ''}
                <div class="country">${card.country ?? ''}</div>
            </div>
        </div>
        <div class="effect"><div>${card.effect?.map(text => formatTextIcons(text)).join(`<br>`).replace(/\n+/g, `<br>`) ?? ''}</div></div>
        `;

        div.innerHTML = html;

        this.reduceToFit(div.querySelector('.effect'));
        //setTimeout(() => this.reduceToFit(div.querySelector('.effect')), 2000);

        if (!ignoreTooltip) {            
            this.game.setTooltip(div.id, this.getTooltip(card));
        }
    }

    private reduceToFit(outerDiv: HTMLDivElement, attemps: number = 0) {
        const innerDiv = outerDiv.getElementsByTagName('div')[0] as HTMLDivElement;
        let fontSize = Number(window.getComputedStyle(innerDiv).fontSize.match(/\d+/)[0]);
        //console.log('card', innerDiv.clientHeight, outerDiv.clientHeight, fontSize);
        while ((innerDiv.clientHeight > outerDiv.clientHeight) && fontSize > 5) {
            //console.log('card while', innerDiv.clientHeight, outerDiv.clientHeight, fontSize);
            fontSize--;
            innerDiv.style.fontSize = `${fontSize}px`;
        }
    }

    private getType(cardId: string) {
        const typeLetter = cardId.substring(0, 1);
        switch (typeLetter) {
            case 'C': return _('City');
            case 'M': return _('Megalith');
            case 'P': return _('Pyramid');
            case 'A': return _('Artifact');
        }
    }

    private getTooltip(card: BuilderCard): string {
        const typeLetter = card.id.substring(0, 1);

        let message = `
        <strong>${card.name}</strong>
        <br>
        <i>${card.country}</i>
        <br>
        <br>
        <strong>${_("Type:")}</strong> ${this.getType(card.id)}
        `;
        if (card.startingSpace) {
            message += `
            <br>
            <strong>${_("Starting space:")}</strong> ${card.startingSpace}
            `;
        }
        if (card.discard) {
            message += `
            <br>
            <strong>${_("Discard cards:")}</strong> ${card.discard}
            `;
        }
        if (card.locked) {
            message += `
            <br>
            <strong>${_("Locked card")}</strong>
            `;
        }
        if (typeLetter != 'A') {
            message += `
            <br>
            <strong>${_("Initial knowledge:")}</strong> ${card.initialKnowledge}
            <br>
            <strong>${_("Victory point:")}</strong> ${card.victoryPoint}
            `;
        }
        message += `
        <br>
        <strong>${_("Activation:")}</strong> ${this.game.getTooltipActivation(card.activation)}
        <br>
        <br>
        <strong>${_("Effect:")}</strong> ${card.effect?.map(text => formatTextIcons(text)).join(`<br>`) ?? ''}
        `;
 
        return message;
    }

    public getFullCard(card: BuilderCard): BuilderCard {
        return {
            ...CARDS_DATA[card.id],
            id: card.id,
            location: card.location,
            knowledge: card.knowledge,
            rotated: card.rotated,
        };
    }

    public getFullCards(cards: BuilderCard[]): BuilderCard[] {
        return cards.map(card => this.getFullCard(card));
    }

    public getFullCardById(id: string): BuilderCard {
        return {
            ...CARDS_DATA[id],
            id,
        };
    }

    public getFullCardsByIds(ids: string[]): BuilderCard[] {
        return ids.map(id => this.getFullCardById(id));
    }
}