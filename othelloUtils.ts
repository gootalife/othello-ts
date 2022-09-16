// export const BoardState = {
//   EMPTY: 0,
//   BLACK: 1,
//   WHITE: -1,
//   CAN_PUT: 2
// } as const

export const boardState: BoardState = {
  EMPTY: 0,
  BLACK: 1,
  WHITE: -1,
  CAN_PUT: 2
}

type BoardState = {
  EMPTY: number
  BLACK: number
  WHITE: number
  CAN_PUT: number
}

export const BOARD_SIZE = 8

export interface Input {
  x: number
  y: number
}

export class Othello {
  private board: typeof boardState[keyof typeof boardState][][] = [[]]
  private isFinished = false
  private turn: typeof boardState[keyof typeof boardState] = boardState.BLACK
  private winner: typeof boardState[keyof typeof boardState] = boardState.EMPTY
  private passCount = 0

  constructor() {
    this.board = new Array(BOARD_SIZE).fill([]).map(() => new Array(BOARD_SIZE).fill(boardState.EMPTY))
    this.board[BOARD_SIZE / 2 - 1][BOARD_SIZE / 2 - 1] = this.board[BOARD_SIZE / 2][BOARD_SIZE / 2] = boardState.BLACK
    this.board[BOARD_SIZE / 2 - 1][BOARD_SIZE / 2] = this.board[BOARD_SIZE / 2][BOARD_SIZE / 2 - 1] = boardState.WHITE
    this.setCanPut()
  }

  getBoard = () => {
    return this.board
  }

  getIsFinished = () => {
    return this.isFinished
  }

  getTurn = () => {
    return this.turn
  }

  getWinner = () => {
    return this.winner
  }

  varifyInput = (input: Input) => {
    if (!this.isWithinRange(input)) {
      return false
    }
    if (this.board[input.y][input.x] !== boardState.CAN_PUT) {
      return false
    }
    return true
  }

  private isWithinRange = (input: Input) => {
    if (input.x < 0 || input.x >= BOARD_SIZE || input.y < 0 || input.y >= BOARD_SIZE) {
      return false
    }
    return true
  }

  private doToAllCells = (func: (x: number, y: number) => void) => {
    this.board.forEach((row, y) => {
      row.forEach((_cell, x) => {
        func(x, y)
      })
    })
  }

  private doToAllCellsAroundCell = (func: (x: number, y: number, dx: number, dy: number) => void, x: number, y: number) => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) {
          continue
        }
        func(x, y, dx, dy)
      }
    }
  }

  private existLine = (x: number, y: number, dx: number, dy: number) => {
    let lineLength = 0
    for (let k = 1; k < BOARD_SIZE; k++) {
      const pos: Input = {
        x: x + dx * k,
        y: y + dy * k
      }
      // 範囲外
      if (!this.isWithinRange(pos)) {
        return false
      }
      // 空白は挟めない
      if (this.board[pos.y][pos.x] === boardState.EMPTY || this.board[pos.y][pos.x] === boardState.CAN_PUT) {
        return false
      }
      // 自分の色は挟めない
      if (lineLength <= 0 && this.board[pos.y][pos.x] === this.turn) {
        return false
      }
      // 相手の色が続いた後に自分の色があるなら置ける
      if (lineLength > 0 && this.board[pos.y][pos.x] === this.turn) {
        return true
      }
      // 相手の色が続くならその先も走査する
      if (this.board[pos.y][pos.x] === this.getOpponentStone(this.turn)) {
        lineLength++
      }
    }
    return false
  }

  private setCanPut = () => {
    this.doToAllCells((x, y) => {
      if (this.board[y][x] === boardState.CAN_PUT) {
        this.board[y][x] = boardState.EMPTY
      }
    })
    this.doToAllCells((x, y) => {
      this.doToAllCellsAroundCell(
        (x, y, dx, dy) => {
          if (this.board[y][x] !== boardState.EMPTY) {
            return
          }
          if (this.existLine(x, y, dx, dy)) {
            this.board[y][x] = boardState.CAN_PUT
          }
        },
        x,
        y
      )
    })
  }

  put = (input: Input) => {
    this.board[input.y][input.x] = this.turn
    const turnOver = (x: number, y: number, dx: number, dy: number) => {
      for (let k = 1; k < BOARD_SIZE; k++) {
        const pos: Input = {
          x: x + dx * k,
          y: y + dy * k
        }
        if (this.board[pos.y][pos.x] === this.getOpponentStone(this.turn)) {
          this.board[pos.y][pos.x] = this.turn
        } else {
          break
        }
      }
    }
    this.doToAllCellsAroundCell(
      (x, y, dx, dy) => {
        if (this.existLine(x, y, dx, dy)) {
          turnOver(x, y, dx, dy)
        }
      },
      input.x,
      input.y
    )
  }

  endTurn = () => {
    this.turn = this.getOpponentStone(this.turn)
    this.setCanPut()
  }

  pass = () => {}

  getOpponentStone = (state: typeof boardState[keyof typeof boardState]) => {
    if (state === boardState.WHITE) {
      return boardState.BLACK
    }
    if (state === boardState.BLACK) {
      return boardState.WHITE
    }
    throw new Error('Invalid stone value.')
  }
}
