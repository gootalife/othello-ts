export const BoardState = {
  EMPTY: 0,
  BLACK: 1,
  WHITE: -1,
  CAN_PUT: 2,
} as const

export const BOARD_SIZE = 8

export type RawBoardState = typeof BoardState[keyof typeof BoardState]

export type Stone = typeof BoardState['BLACK'] | typeof BoardState['WHITE']

export interface Input {
  x: number
  y: number
}

export class Othello {
  private _board: RawBoardState[][] = [[]]
  private _isFinished = false
  private _turn: Stone = BoardState.BLACK
  private _winner: Stone | undefined = undefined
  private _passCount = 0

  constructor() {
    this._board = new Array(BOARD_SIZE).fill([]).map(() => new Array(BOARD_SIZE).fill(BoardState.EMPTY))
    this._board[BOARD_SIZE / 2 - 1][BOARD_SIZE / 2 - 1] = this._board[BOARD_SIZE / 2][BOARD_SIZE / 2] = BoardState.BLACK
    this._board[BOARD_SIZE / 2 - 1][BOARD_SIZE / 2] = this._board[BOARD_SIZE / 2][BOARD_SIZE / 2 - 1] = BoardState.WHITE
    this.setCanPut()
  }

  get board() {
    return this._board
  }

  get isFinished() {
    return this._isFinished
  }

  get turn() {
    return this._turn
  }

  get winner() {
    return this._winner
  }

  // 入力が正しいか判定する
  verifyInput = (input: Input) => {
    // 範囲外
    if (!this.isWithinRange(input)) {
      return false
    }
    // 入力の座標に置けない
    if (this._board[input.y][input.x] !== BoardState.CAN_PUT) {
      return false
    }
    return true
  }

  // 石を置く
  put = (input: Input) => {
    if (!this.verifyInput(input)) {
      throw new Error('Invalid input.')
    }
    // 置くとき連続パス回数のカウントをリセット
    this._passCount = 0
    this._board[input.y][input.x] = this._turn
    // 裏返しの処理
    const turnOver = (x: number, y: number, dx: number, dy: number) => {
      for (let k = 1; k < BOARD_SIZE; k++) {
        const pos: Input = {
          x: x + dx * k,
          y: y + dy * k,
        }
        if (this._board[pos.y][pos.x] === this.getOpponentStone(this._turn)) {
          this._board[pos.y][pos.x] = this._turn
        } else {
          break
        }
      }
    }
    // 置いた場所の周囲を走査して裏返す
    this.doToAllCellsAroundCell((x, y, dx, dy) => {
      if (this.existLine(x, y, dx, dy)) {
        turnOver(x, y, dx, dy)
      }
    }, input.x, input.y)
  }

  // ターン終了の処理
  endTurn = () => {
    this._turn = this.getOpponentStone(this._turn)
    this.setCanPut()
  }

  // パスの処理
  pass = () => {
    this._passCount++
    // 先手後手ともにパスならゲーム終了
    if (this._passCount >= 2) {
      this._isFinished = true
      const blackCount = this._board.flat().filter((cell) => cell === BoardState.BLACK).length
      const whiteCount = this._board.flat().filter((cell) => cell === BoardState.WHITE).length
      if (blackCount > whiteCount) {
        this._winner = BoardState.BLACK
      } else if (blackCount < whiteCount) {
        this._winner = BoardState.WHITE
      } else {
        this._winner = undefined
      }
    } else {
      this.endTurn()
    }
  }

  // 相手の石を受け取る
  private getOpponentStone = (state: Stone) => {
    return state === BoardState.BLACK ? BoardState.BLACK : BoardState.WHITE
  }

  // ボードの範囲内か判定する
  private isWithinRange = (input: Input) => {
    return input.x >= 0 && input.x < BOARD_SIZE && input.y >= 0 && input.y < BOARD_SIZE
  }

  // すべてのセルに対して処理
  private doToAllCells = (func: (x: number, y: number) => void) => {
    this._board.forEach((row, y) => {
      row.forEach((_cell, x) => {
        func(x, y)
      })
    })
  }

  // セルの周囲のセルに対して処理
  private doToAllCellsAroundCell = (func: (x: number, y: number, dx: number, dy: number) => void, x: number, y: number) => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        // 方向成分無しは無視
        if (dx === 0 && dy === 0) {
          continue
        }
        func(x, y, dx, dy)
      }
    }
  }

  // ある方向に挟むことができるか判定する
  private existLine = (x: number, y: number, dx: number, dy: number) => {
    let lineLength = 0
    for (let k = 1; k < BOARD_SIZE; k++) {
      const pos: Input = {
        x: x + dx * k,
        y: y + dy * k,
      }
      // 範囲外
      if (!this.isWithinRange(pos)) {
        return false
      }
      // 空白は挟めない
      if (this._board[pos.y][pos.x] === BoardState.EMPTY || this._board[pos.y][pos.x] === BoardState.CAN_PUT) {
        return false
      }
      // 自分の色は挟めない
      if (lineLength <= 0 && this._board[pos.y][pos.x] === this._turn) {
        return false
      }
      // 相手の色が続いた後に自分の色があるなら置ける
      if (lineLength > 0 && this._board[pos.y][pos.x] === this._turn) {
        return true
      }
      // 相手の色が続くならその先も走査する
      if (this._board[pos.y][pos.x] === this.getOpponentStone(this._turn)) {
        lineLength++
      }
    }
    return false
  }

  // 置ける場所を設定する
  private setCanPut = () => {
    // ステートをリセット
    this.doToAllCells((x, y) => {
      if (this._board[y][x] === BoardState.CAN_PUT) {
        this._board[y][x] = BoardState.EMPTY
      }
    })
    // 置ける場所を設定する
    this.doToAllCells((x, y) => {
      this.doToAllCellsAroundCell((x, y, dx, dy) => {
        if (this._board[y][x] !== BoardState.EMPTY) {
          return
        }
        if (this.existLine(x, y, dx, dy)) {
          this._board[y][x] = BoardState.CAN_PUT
        }
      }, x, y)
    })
  }
}
