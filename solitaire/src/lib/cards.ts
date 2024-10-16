import { CARD_SUIT_TO_COLOR, CardSuit, CardSUitColor, CardValue } from "./common";

export class Card {
  readonly #suit: CardSuit
  readonly #value: CardValue
  #faceUp: boolean

  constructor(suit: CardSuit, value: CardValue, isFaceUp = false) {
    this.#suit = suit
    this.#value = value
    this.#faceUp = isFaceUp
  }

  get suit(): CardSuit {
    return this.#suit
  }
  get value(): CardValue {
    return this.#value
  }
  get isFaceUp(): boolean {
    return this.#faceUp
  }

  get color(): CardSUitColor {
    return CARD_SUIT_TO_COLOR[this.#suit]
  }

  public flip(): void {
    this.#faceUp = !this.#faceUp
  }
}
