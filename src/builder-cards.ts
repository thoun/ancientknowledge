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
    lockedSpace: boolean;
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
        const backgroundPositionX = ((card.number - 1) % 6) * 100 / 5;
        const backgroundPositionY = Math.floor((card.number - 1) / 6) * 100 / 5;
        div.dataset.type = typeLetter;
        div.style.setProperty('--card-color', CARD_COLORS[typeLetter]);
        div.style.backgroundPositionX = `${backgroundPositionX}%`;
        div.style.backgroundPositionY = `${backgroundPositionY}%`;
        let html = ``;

        // TODO TEMP
        html += `<div class="implemented" data-implemented="${card.implemented?.toString() ?? 'false'}"></div>
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
        if (!innerDiv) {
            return;
        }
        const match = window.getComputedStyle(innerDiv).fontSize.match(/\d+/);
        if (!match) {
            return;
        }
        let fontSize = Number(match[0]);
        //console.log('card', innerDiv.clientHeight, outerDiv.clientHeight, fontSize);
        while ((innerDiv.clientHeight > outerDiv.clientHeight) && fontSize > 5) {
            //console.log('card while', innerDiv.clientHeight, outerDiv.clientHeight, fontSize);
            fontSize--;
            innerDiv.style.fontSize = `${fontSize}px`;
        }

        if (attemps < 5) {
            attemps++;
            setTimeout(() => this.reduceToFit(outerDiv, attemps));
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

    public getTooltip(card: BuilderCard): string {
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
        if (card.lockedSpace) {
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
        <br>
        <br>
        ${this.generateCardDiv({...card, id: `${card.id}--tooltip-card`}).outerHTML}
        `;
 
        return message;
    }

    public generateCardDiv(card: BuilderCard): HTMLDivElement {
        const tempDiv: HTMLDivElement = document.createElement('div');
        tempDiv.classList.add('card', 'builder-card');
        tempDiv.innerHTML = `
        <div class="card-sides">
            <div class="card-side front"></div>
        </div>
        `;

        document.body.appendChild(tempDiv);
        this.setupFrontDiv(card, tempDiv.querySelector('.front'), true);
        document.body.removeChild(tempDiv);
            
        return tempDiv;
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