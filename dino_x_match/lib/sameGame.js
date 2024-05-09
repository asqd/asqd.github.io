class SameGame {
  constructor(options) {
    this.rows = options.rows;
    this.columns = options.columns;
    this.items = options.items;
    this.gameArray = [];
    this.generateBoard();
  }

  generateBoard() {
    for (let row = 0; row < this.rows; row++) {
      this.gameArray[row] = [];
      for (let col = 0; col < this.columns; col++) {
        let value = Math.floor(Math.random() * this.items);
        this.gameArray[row][col] = { value: value, isEmpty: false, row: row, column: col };
      }
    }
  }

  getRows() {
    return this.rows;
  }

  getColumns() {
    return this.columns;
  }

  isEmpty(row, col) {
    return this.gameArray[row][col].isEmpty;
  }

  getValueAt(row, col) {
    return this.gameArray[row][col].value;
  }

  setCustomData(row, col, data) {
    this.gameArray[row][col].customData = data;
  }

  getCustomDataAt(row, col) {
    return this.gameArray[row][col].customData;
  }

  validPick(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.columns && this.gameArray[row] && this.gameArray[row][col];
  }

  listConnectedItems(row, col) {
    if (this.validPick(row, col) && !this.isEmpty(row, col)) {
      this.colorToLookFor = this.gameArray[row][col].value;
      this.floodFillArray = [];
      this.floodFill(row, col);
      return this.floodFillArray;
    }
    return [];
  }

  countConnectedItems(row, col) {
    return this.listConnectedItems(row, col).length;
  }

  removeConnectedItems(row, col) {
    this.listConnectedItems(row, col).forEach(item => {
      this.gameArray[item.row][item.column].isEmpty = true;
    });
  }

  stillPlayable(minimumMatches) {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        if (!this.isEmpty(row, col) && this.countConnectedItems(row, col) >= minimumMatches) {
          return true;
        }
      }
    }
    return false;
  }

  nonEmptyItems() {
    let count = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        if (!this.isEmpty(row, col)) {
          count++;
        }
      }
    }
    return count;
  }

  floodFill(row, col) {
    if (!this.validPick(row, col) || this.isEmpty(row, col)) {
      return;
    }
    if (this.gameArray[row][col].value !== this.colorToLookFor || this.alreadyVisited(row, col)) {
      return;
    }
    this.floodFillArray.push({ row: row, column: col });
    this.floodFill(row + 1, col);
    this.floodFill(row - 1, col);
    this.floodFill(row, col + 1);
    this.floodFill(row, col - 1);
  }

  alreadyVisited(row, col) {
    return this.floodFillArray.some(item => item.row === row && item.column === col);
  }

  arrangeBoard() {
    let moves = [];
    for (let row = this.rows - 2; row >= 0; row--) {
      for (let col = 0; col < this.columns; col++) {
        if (!this.isEmpty(row, col)) {
          let emptySpacesBelow = this.emptySpacesBelow(row, col);
          if (emptySpacesBelow > 0) {
            this.swapItems(row, col, row + emptySpacesBelow, col);
            moves.push({ row: row + emptySpacesBelow, column: col, deltaRow: emptySpacesBelow });
          }
        }
      }
    }
    return moves;
  }

  emptySpacesBelow(row, col) {
    let spaces = 0;
    for (let i = row + 1; i < this.rows; i++) {
      if (this.isEmpty(i, col)) {
        spaces++;
      }
    }
    return spaces;
  }

  swapItems(row1, col1, row2, col2) {
    let temp = Object.assign({}, this.gameArray[row1][col1]);
    this.gameArray[row1][col1] = Object.assign({}, this.gameArray[row2][col2]);
    this.gameArray[row2][col2] = Object.assign({}, temp);
  }

  compactBoardToLeft() {
    let moves = [];
    for (let col = 1; col < this.columns; col++) {
      if (!this.isEmptyColumn(col)) {
        let emptyColumnsToLeft = this.countLeftEmptyColumns(col);
        if (emptyColumnsToLeft > 0) {
          for (let row = 0; row < this.rows; row++) {
            if (!this.isEmpty(row, col)) {
              this.swapItems(row, col, row, col - emptyColumnsToLeft);
              moves.push({ row: row, column: col - emptyColumnsToLeft, deltaColumn: -emptyColumnsToLeft });
            }
          }
        }
      }
    }
    return moves;
  }

  isEmptyColumn(col) {
    for (let row = 0; row < this.rows; row++) {
      if (!this.isEmpty(row, col)) {
        return false;
      }
    }
    return true;
  }

  countLeftEmptyColumns(col) {
    let count = 0;
    for (let i = col - 1; i >= 0; i--) {
      if (this.isEmptyColumn(i)) {
        count++;
      }
    }
    return count;
  }

  replenishBoard() {
    let moves = [];
    for (let col = 0; col < this.columns; col++) {
      if (this.isEmpty(0, col)) {
        let emptySpacesBelow = this.emptySpacesBelow(0, col) + 1;
        for (let row = 0; row < emptySpacesBelow; row++) {
          let value = Math.floor(Math.random() * this.items);
          moves.push({ row: row, column: col, deltaRow: emptySpacesBelow });
          this.gameArray[row][col].value = value;
          this.gameArray[row][col].isEmpty = false;
        }
      }
    }

    return moves;
  }

}
