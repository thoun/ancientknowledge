class PastDeck extends AllVisibleDeck<BuilderCard> {
    constructor(protected manager: CardManager<BuilderCard>, protected element: HTMLElement) {
        super(manager, element, {
            verticalShift: '2px',
            horizontalShift: '2px',
            direction: 'mixed' as any,
            counter: {
                hideWhenEmpty: true,
            },
        });
        element.classList.add('past-deck');
    }
    
    public resetPastOrder() {
        const cards = this.getCards();
        const rotatedCards = cards.filter(card => card.rotated);
        const unrotatedCards = cards.filter(card => !card.rotated);


        rotatedCards.forEach((card, index) => {
            const cardDiv = this.getCardElement(card);
            cardDiv.style.setProperty('--rotated-order', ''+index);
            cardDiv.style.setProperty('--unrotated-order', '0');
        });

        unrotatedCards.forEach((card, index) => {
            const cardDiv = this.getCardElement(card);
            cardDiv.style.setProperty('--rotated-order', '0');
            cardDiv.style.setProperty('--unrotated-order', `${index + (rotatedCards.length ? 1 : 0)}`);
        });
    }
}
