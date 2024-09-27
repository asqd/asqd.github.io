import * as Phaser from 'phaser'
import { ASSET_KEYS, CARD_HEIGHT, CARD_WIDTH, SCENE_KEYS } from './common'

const DEBUG = true;
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
    this.#createDragEvents()
  }

  #createDrawPile(): void {
    this.#drawCardLocationBox(DRAW_PILE_X, DRAW_PILE_Y)

    this.#drawPileCards = []
    for (let i = 0; i < 3; i += 1) {
      const shift = i * 2

      this.#drawPileCards.push(
        this.#createCard(DRAW_PILE_X + shift, DRAW_PILE_Y + shift, false)
      )
    }

    const drawZone = this.add.zone(
      DRAW_PILE_X - 5,
      DRAW_PILE_Y - 5,
      CARD_WIDTH * SCALE + 10,
      CARD_HEIGHT * SCALE + 10
    ).setOrigin(0)
      .setInteractive()

    drawZone.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.#discardPileCards[0].setFrame(this.#discardPileCards[1].frame)
        .setVisible(this.#discardPileCards[1].visible)

      this.#discardPileCards[1].setFrame(CARD_BACK_FRAME).setVisible(true)
    })

    if (DEBUG) {
      this.add.rectangle(
        drawZone.x, drawZone.y, 
        drawZone.width, drawZone.height, 
        0xff0000, 0.5
      ).setOrigin(0)
    }
  }

  #createDiscardPile(): void {
    const x = DISCARD_PILE_X + TABLEAU_PILE_WIDTH
    this.#drawCardLocationBox(x, DISCARD_PILE_Y)

    this.#discardPileCards = []
    const bottomCard = this.#createCard(x, DISCARD_PILE_Y, true).setVisible(false)
    const topCard = this.#createCard(x, DISCARD_PILE_Y, true).setVisible(false)

    this.#discardPileCards.push(bottomCard, topCard)
  }

  #createFoundationPiles(): void {
    this.#foundationPileCards = []

    for (let row = 3; row < 7; row += 1) {
      const x = row * TABLEAU_PILE_WIDTH + FOUNDATION_PILE_X
      this.#drawCardLocationBox(x, FOUNDATION_PILE_Y)

      const card = this.#createCard(x, FOUNDATION_PILE_Y, false).setVisible(false)
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
        const cardGameObject = this.#createCard(0, card_num * 15, true, card_num, pile)
        tableauContainer.add(cardGameObject)
      }
    }
  }

  #drawCardLocationBox(x: number, y: number): void {
    this.add.rectangle(
      x, y, CARD_BOX_WIDTH, CARD_BOX_HEIGHT
    ).setOrigin(0).setStrokeStyle(2, 0x000000, 0.5).setScale(SCALE)
  }

  #createCard(x: number, y: number, draggable: boolean, cardIndex?: number, pileIndex?: number): Phaser.GameObjects.Image {
    return this.add.image(
      x, y, ASSET_KEYS.CARDS, CARD_BACK_FRAME
    ).setOrigin(0).setScale(SCALE)
      .setInteractive({ draggable: draggable })
      .setData({
        x, y,
        cardIndex,
        pileIndex
      })
  }

  #createDragEvents(): void {
    this.#createDragStartEventListener()
    this.#createOnDragEventListener()
    this.#createOnDragEndEventListener()
  }

  #createDragStartEventListener() {
    this.input.on(
      Phaser.Input.Events.DRAG_START,
      (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
        gameObject.setData({ x: gameObject.x, y: gameObject.y })

        const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined

        if (tableauPileIndex !== undefined) {
          // Обновляем глубину контейнера, чтобы можно было перетаскивать карты над остальными объектами
          this.#tableauContainers[tableauPileIndex].setDepth(2)
        } else {
          // выделяем активный объект
          gameObject.setDepth(2)
        }

        gameObject.setAlpha(0.8)
      }
    )
  }

  #createOnDragEventListener(): void {
    this.input.on(
      Phaser.Input.Events.DRAG,
      (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
        gameObject.setPosition(dragX, dragY)
        gameObject.setDepth(0)

        const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined
        const cardIndex = gameObject.getData('cardIndex') as number

        if (tableauPileIndex !== undefined) {
          const numberOfCardToMove =  this.#numberOfCardsToMoveInStack(tableauPileIndex, cardIndex)

          for (let i = 1; i <= numberOfCardToMove; i += 1) {
            this.#tableauContainers[tableauPileIndex]
              .getAt<Phaser.GameObjects.Image>(cardIndex + i)
              .setPosition(dragX, dragY + 15 * i)
          }
        }
      }
    )
  }

  #createOnDragEndEventListener(): void {
    this.input.on(
      Phaser.Input.Events.DRAG_END,
      (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
        const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined

        if (tableauPileIndex !== undefined) {
          // Обновляем глубину контейнера, чтобы можно было перетаскивать карты над остальными объектами
          this.#tableauContainers[tableauPileIndex].setDepth(0)
        } else {
          // выделяем активный объект
          gameObject.setDepth(0)
        }

        gameObject.setPosition(gameObject.getData('x') as integer, gameObject.getData('y') as integer)
        // TODO: проверить пересечение объекта с домами, стопкой и определить куда поместить карту
        gameObject.setAlpha(1)

        const cardIndex = gameObject.getData('cardIndex') as number;
        if (tableauPileIndex !== undefined) {
          const numberOfCardsToMove = this.#numberOfCardsToMoveInStack(tableauPileIndex, cardIndex);
          for (let i = 1; i <= numberOfCardsToMove; i += 1) {
            const cardToMove = this.#tableauContainers[tableauPileIndex].getAt<Phaser.GameObjects.Image>(cardIndex + i);
            cardToMove.setPosition(cardToMove.getData('x') as number, cardToMove.getData('y') as number);
          }
        }
      }
    )
  }

  #numberOfCardsToMoveInStack(tableauPileIndex: number, cardIndex: number): number {
    if (tableauPileIndex !== undefined) {
      const lastCardIndex = this.#tableauContainers[tableauPileIndex].length - 1

      if (lastCardIndex === cardIndex) {
        return 0
      }

      return  lastCardIndex - cardIndex
    }

    return 0
  }
}
