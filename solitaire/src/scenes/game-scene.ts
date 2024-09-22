import * as Phaser from 'phaser'
import { ASSET_KEYS, SCENE_KEYS } from './common'

const DEBUG = false;
const SCALE = 1.4;
const SHIFT_X = 20;
const SHIFT_Y = 15;
const CARD_BACK_FRAME = 52;

const FOUNDATION_PILE_X = SHIFT_X;
const FOUNDATION_PILE_Y = SHIFT_Y;

const DISCARD_PILE_X = SHIFT_X;
const DISCARD_PILE_Y = SHIFT_Y;

const DRAW_PILE_X = SHIFT_X;
const DRAW_PILE_Y = SHIFT_Y;

const TABLEAU_PILE_X = SHIFT_X;
const TABLEAU_PILE_Y = 85 + SHIFT_Y;
const TABLEAU_PILE_WIDTH = 85;

const CARD_BOX_WIDTH = 37;
const CARD_BOX_HEIGHT = 52;

const SUIT_FRAMES = {
  HEART: 26,
  DIAMOND: 13,
  SPADE: 39,
  CLUB: 0
}

export class GameScene extends Phaser.Scene {
  #drawPileCards!: Phaser.GameObjects.Image[];
  #discardPileCards!: Phaser.GameObjects.Image[];
  #foundationPileCards!: Phaser.GameObjects.Image[];
  #tableauContainers!: Phaser.GameObjects.Container[];

  constructor() {
    super({ key: SCENE_KEYS.GAME })
  }

  public create(): void {
    this.#createDrawPile()
    this.#createDiscardPile()
    this.#createFoundationPiles()
    this.#createTableauPiles()
  }

  #createDrawPile(): void {
    this.#drawCardLocationBox(DRAW_PILE_X, DRAW_PILE_Y)

    this.#drawPileCards = []
    for (let i = 0; i < 3; i += 1) {
      const shift = i * 2
      
      this.#drawPileCards.push(
        this.#createCard(DRAW_PILE_X + shift, DRAW_PILE_Y + shift)
      )
    }
  }

  #createDiscardPile(): void {
    const x = DISCARD_PILE_X + TABLEAU_PILE_WIDTH
    this.#drawCardLocationBox(x, DISCARD_PILE_Y)

    this.#discardPileCards = []
    const bottomCard = this.#createCard(x, DISCARD_PILE_Y).setVisible(false)
    const topCard = this.#createCard(x, DISCARD_PILE_Y).setVisible(false)

    this.#discardPileCards.push(bottomCard, topCard)
  }

  #createFoundationPiles(): void {
    this.#foundationPileCards = []

    for (let row = 3; row < 7; row += 1) {
      const x = row * TABLEAU_PILE_WIDTH + FOUNDATION_PILE_X
      this.#drawCardLocationBox(x, FOUNDATION_PILE_Y)

      const card = this.#createCard(x, FOUNDATION_PILE_Y).setVisible(false)
      this.#foundationPileCards.push(card)
    }
  }

  #createTableauPiles(): void {
    this.#tableauContainers = []

    for (let pile = 0; pile < 7; pile += 1) {
      const x = TABLEAU_PILE_X + pile * TABLEAU_PILE_WIDTH

      const tableauContainer = this.add.container(x, TABLEAU_PILE_Y, [])
      this.#tableauContainers.push(tableauContainer)

      for (let card_num = 0; card_num < pile + 1; card_num += 1) {
        const cardGameObject = this.#createCard(0, card_num * 15)
        tableauContainer.add(cardGameObject)
      }
    }
  }

  #drawCardLocationBox(x: number, y: number): void {
    this.add.rectangle(
      x, y, CARD_BOX_WIDTH, CARD_BOX_HEIGHT
    ).setOrigin(0).setStrokeStyle(2, 0x000000, 0.5).setScale(SCALE)
  }

  #createCard(x: number, y: number): Phaser.GameObjects.Image {
    return this.add.image(
      x, y, ASSET_KEYS.CARDS, CARD_BACK_FRAME
    ).setOrigin(0).setScale(SCALE)
  }
}
