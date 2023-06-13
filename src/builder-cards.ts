interface BuilderCard {
    id: string;
    location: string;
    state;
    pId: number;

    number: number;
    name: string;
    text: string[];
    country: string;
    startingSpace: string;
    initialKnowledge: string;
    victoryPoint: string;
    discard: string;
    locked: boolean;
    activation: string;
    effect: string[];
}

const CARD_COLORS = {
  'A': '#734073',
  'C': '#d66b2a',
  'M': '#4a82a3',
  'P': '#87a04f',
};

class BuilderCardsManager extends CardManager<BuilderCard> {
    constructor (public game: AncientKnowledgeGame) {
        super(game, {
            getId: (card) => `builder-card-${card.id}`,
            setupDiv: (card: BuilderCard, div: HTMLElement) => {
                div.classList.add('builder-card');
                div.dataset.cardId = ''+card.id;
            },
            setupFrontDiv: (card: BuilderCard, div: HTMLElement) => this.setupFrontDiv(card, div),
            isCardVisible: card => Boolean(card.number),
            cardWidth: 163,
            cardHeight: 228,
            animationManager: game.animationManager,
        });
    }

    private setupFrontDiv(card: BuilderCard, div: HTMLElement, ignoreTooltip: boolean = false) { 
        const typeLetter = card.id.substring(0, 1);
        div.style.setProperty('--card-color', CARD_COLORS[typeLetter]);
        /*
        div.dataset.type = ''+card.type;
        div.dataset.number = ''+card.number;*/
        const backgroundPositionX = ((card.number - 1) % 6) * 100 / 5;
        const backgroundPositionY = Math.floor((card.number - 1) / 6) * 100 / 5;
        let html = `
        <div class="background" data-type="${typeLetter}" style="background-position: ${backgroundPositionX}% ${backgroundPositionY}%"></div>
        <div class="type-box" data-type="${typeLetter}">
            <div class="type" data-type="${typeLetter}">
                <div class="type-icon"></div>
            </div>
        `;
        if (card.startingSpace) {
            html += `<div class="starting-space">${card.startingSpace}</div>`;
        }
        html += `</div>`;

        if (card.discard) {
            html += `
            <div class="discard">
                <div class="discard-text">${card.discard}</div>
                <div class="discard-icon"></div>
            </div>`;
        } else if (card.locked) {
            html += `
            <div class="discard">
                <div class="lock-icon"></div>
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
        <div class="effect">${card.effect?.map(text => formatTextIcons(text)).join(`<br>`) ?? ''}</div>
        `;

        div.innerHTML = html;

        if (!ignoreTooltip) {            
            this.game.setTooltip(div.id, this.getTooltip(card));
        }
    }

    private getTooltip(card: BuilderCard): string {
        let message = `<pre>${JSON.stringify(card, null, 2)}</pre>`; // TODO TEMP
        /*let message = `
        <strong>${_("Type:")}</strong> ${card.type}
        <br>
        <strong>${_("TODO number:")}</strong> ${card.number}
        `;*/
 
        return message;
    }
}