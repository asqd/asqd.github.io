export class Solitaire {
  public newGame(): void {

  }

  public drawCard(): boolean {
    return true
  }

  public shuffleDiscardPile(): boolean {
    return true
  }

  public playDiscardPileToFoundation(): boolean {
    return true
  }

  public playDiscardPileToTableau(targetTableauIndex: number): boolean {
    return true
  }

  public flipTopTableauCard(tableauIndex: number): boolean{
    return true
  }

  public moveTableauCardsToAnotherTableau(
    initialTableauIndex: number,
    cardIndex: number,
    targetTableauIndex: number,
  ): boolean {
    return true
  }

  public moveTableauCardToFoundation(tableauIndex: number): boolean {
    return true
  }
}
