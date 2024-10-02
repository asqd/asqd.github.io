import * as Phaser from 'phaser'
import { ASSET_KEYS, CARD_HEIGHT, CARD_WIDTH, SCENE_KEYS } from './common'
import { Solitaire } from '../lib/solitaire';

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

type ZoneType = keyof typeof ZONE_TYPE;

const ZONE_TYPE = {
  FOUNDATION: 'FOUNDATION',
  TABLEAU: 'TABLEAU',
} as const;

export class GameScene extends Phaser.Scene {
  #solitaire!: Solitaire;
  #drawPileCards!: Phaser.GameObjects.Image[];
  #discardPileCards!: Phaser.GameObjects.Image[];
  #foundationPileCards!: Phaser.GameObjects.Image[];
  #tableauContainers!: Phaser.GameObjects.Container[];

  constructor() {
    super({ key: SCENE_KEYS.GAME })
  }

  public create(): void {
    this.#solitaire = new Solitaire()
    this.#solitaire.newGame()
    this.#createDrawPile()
    this.#createDiscardPile()
    this.#createFoundationPiles()
    this.#createTableauPiles()
    this.#createDragEvents()
    this.#createDropZones()
    this.#createDropEventListener()
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
        const cardGameObject = this.#createCard(0, card_num * SHIFT_Y, true, card_num, pile)
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
              .setPosition(dragX, dragY + SHIFT_Y * i)
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

        if (gameObject.active) {
          gameObject.setPosition(gameObject.getData('x') as number, gameObject.getData('y') as number)
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

  #createDropZones(): void {
    const foundationX = 3 * (TABLEAU_PILE_WIDTH) + (FOUNDATION_PILE_X) - 5
    const foundationWidth = 6 * (CARD_WIDTH * SCALE) + FOUNDATION_PILE_X - 10
    const foundationHeight = CARD_HEIGHT * SCALE + FOUNDATION_PILE_Y - 5

    let zone = this.add.zone(foundationX, FOUNDATION_PILE_Y - 5, foundationWidth, foundationHeight)
      .setOrigin(0)
      .setRectangleDropZone(foundationWidth, foundationHeight)
      .setData({ zoneType: ZONE_TYPE.FOUNDATION })

    if (DEBUG) {
      this.add.rectangle(
        foundationX, FOUNDATION_PILE_Y - 5, zone.width, zone.height, 0xff0000, 0.2
      ).setOrigin(0)
    }

    for (let pile = 0; pile < 7; pile += 1) {
      const x = TABLEAU_PILE_X + pile * TABLEAU_PILE_WIDTH - 5
      const pileZoneWidth = CARD_WIDTH * SCALE + 10
      const pileZoneHeight = CARD_HEIGHT * SCALE * 4

      let zone = this.add.zone(x, TABLEAU_PILE_Y, pileZoneWidth, pileZoneHeight)
        .setOrigin(0)
        .setRectangleDropZone(pileZoneWidth, pileZoneHeight)
        .setData({ zoneType: ZONE_TYPE.TABLEAU, tableauIndex: pile })
        .setDepth(-1)

      if (DEBUG) {
        this.add.rectangle(
          x, TABLEAU_PILE_Y, zone.width, zone.height, 0xff0000, 0.5
        ).setOrigin(0)
      }
    }
  }

  #createDropEventListener(): void {
    this.input.on(
      Phaser.Input.Events.DROP,
      (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
        const zoneType = dropZone.getData('zoneType') as ZoneType
        if (zoneType === ZONE_TYPE.FOUNDATION) {
          this.#handleMoveCardToFoundation(gameObject)
          return
        }
        const tableauIndex = dropZone.getData('tableauIndex') as number
        this.#handleMoveCardTableau(gameObject, tableauIndex)
      }
    )
  }

  #handleMoveCardToFoundation(gameObject: Phaser.GameObjects.Image): void {
    let isValidMove = false
    let isCardFromDiscardPile = false

    const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined
    if (tableauPileIndex === undefined) {
      isValidMove = this.#solitaire.playDiscardPileToFoundation()
      isCardFromDiscardPile = true
    } else {
      isValidMove = this.#solitaire.moveTableauCardToFoundation(tableauPileIndex)
    }

    if (!isValidMove) {
      return
    }

    if (isCardFromDiscardPile) {
      this.#updateCardGameObjectsInDiscardPile()
    } else {
      this.#handleRevealingNewTableauCards(tableauPileIndex as number)
    }

    if (!isCardFromDiscardPile) {
      gameObject.destroy()
    }

    // this.#updateFoundationPiles()
  }

  #handleMoveCardTableau(gameObject: Phaser.GameObjects.Image, targetTableauPileIndex: number): void {
    console.log('placed card on tableau pile', targetTableauPileIndex);
    let isValidMove = false
    let isCardFromDiscardPile = false

    const originalTargetPileSize = this.#tableauContainers[targetTableauPileIndex].length

    const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined
    const tableauCardIndex = gameObject.getData('cardIndex') as number
    if (tableauPileIndex === undefined) {
      isValidMove = this.#solitaire.playDiscardPileToTableau(targetTableauPileIndex)
      isCardFromDiscardPile = true
    } else {
      isValidMove = this.#solitaire.moveTableauCardsToAnotherTableau(
        tableauPileIndex,
        tableauCardIndex,
        targetTableauPileIndex
      )
    }

    if (!isValidMove) {
      return
    }

    if (isCardFromDiscardPile) {
      const card = this.#createCard(
        0,
        originalTargetPileSize * SHIFT_Y,
        true,
        originalTargetPileSize,
        targetTableauPileIndex
      )
      card.setFrame(gameObject.frame)
      this.#tableauContainers[targetTableauPileIndex].add(card)
      this.#updateCardGameObjectsInDiscardPile()

      return
    }
 
    const numberOfCardsToMove = this.#numberOfCardsToMoveInStack(tableauCardIndex as number, tableauCardIndex)
    for (let i = 0; i <= numberOfCardsToMove; i += 1) {
      const cardGameObject = this.#tableauContainers[tableauPileIndex as number].getAt<Phaser.GameObjects.Image>(tableauCardIndex)
      this.#tableauContainers[tableauPileIndex as number].removeAt(tableauCardIndex)
      this.#tableauContainers[targetTableauPileIndex].add(cardGameObject)

      const cardIndex = originalTargetPileSize + i
      cardGameObject.setData({
        x: 0,
        y: cardIndex * SHIFT_Y,
        cardIndex,
        pileIndex: targetTableauPileIndex
      })
    }

    this.#tableauContainers[tableauPileIndex as number].setDepth(0)
    this.#handleRevealingNewTableauCards(tableauPileIndex as number)
  }

  #updateCardGameObjectsInDiscardPile(): void {
    this.#discardPileCards[1].setFrame(this.#discardPileCards[0].frame).setVisible(this.#discardPileCards[0].visible)
    this.#discardPileCards[0].setVisible(false)

    // TODO: get card state from Solitaire and update bottom card frame based on it 
  }

  #handleRevealingNewTableauCards(tableauIndex: number): void {
    return
  }

  #updateFoundationPoles(): void {
    return
  }
}
