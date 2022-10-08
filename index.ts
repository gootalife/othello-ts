import { BoardState, BOARD_SIZE, Input, Othello, RawBoardState } from './othelloUtils'
import readline from 'readline'

const readStdIn = (question: string) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise<string>((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer)
      rl.close()
    })
  })
}

const printBoard = (board: RawBoardState[][]) => {
  for (let colNum = 0; colNum <= BOARD_SIZE; colNum++) {
    process.stdout.write(colNum === 0 ? '  ' : ` ${colNum}`)
  }
  console.log()
  board.forEach((row, y) => {
    process.stdout.write(` ${y + 1}`)
    row.forEach((cell) => {
      process.stdout.write(getStateSymbol(cell))
    })
    console.log()
  })
  console.log()
}

const getStateSymbol = (cell: RawBoardState) => {
  let symbol = '  '
  switch (cell) {
    case BoardState.EMPTY:
      symbol = '・'
      break
    case BoardState.BLACK:
      symbol = '○'
      break
    case BoardState.WHITE:
      symbol = '●'
      break
    case BoardState.CAN_PUT:
      symbol = '☆'
      break
  }
  return symbol
}

const getUserInput = async (othello: Othello) => {
  let input: Input = {
    x: -1,
    y: -1,
  }
  while (true) {
    printBoard(othello.board)
    const line = await readStdIn(`Where do you put ${getStateSymbol(othello.turn)}? > `)
    const inputArr = line.split(' ')
    if (inputArr.length !== 2) {
      console.log('\nInput error\n')
      continue
    }
    input = {
      x: Number(inputArr[0]) - 1,
      y: Number(inputArr[1]) - 1,
    }
    if (!othello.verifyInput(input)) {
      console.log('\nInput error\n')
      continue
    }
    console.log()
    break
  }
  return input
}

const main = async () => {
  const othello = new Othello()
  while (!othello.isFinished) {
    // 置ける場所がないならパス
    if (othello.board.flat().filter((cell) => cell === BoardState.CAN_PUT).length <= 0) {
      console.log(`${getStateSymbol(othello.turn)} passed.\n`)
      othello.pass()
      continue
    }
    const input = await getUserInput(othello)
    othello.put(input)
    console.log(`${getStateSymbol(othello.turn)} was put at (${input.x},${input.y})\n`)
    othello.endTurn()
  }
  // ゲーム終了
  console.log('--- Result ---\n')
  printBoard(othello.board)
  console.log(`${getStateSymbol(BoardState.BLACK)}: ${othello.board.flat().filter((cell) => cell === BoardState.BLACK).length}`)
  console.log(`${getStateSymbol(BoardState.WHITE)}: ${othello.board.flat().filter((cell) => cell === BoardState.WHITE).length}\n`)
  const winner = othello.winner
  console.log(winner ? `${getStateSymbol(winner)} won!!\n` : 'Draw!!')
}

main()
