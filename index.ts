import { boardState, BOARD_SIZE, Input, Othello } from './othelloUtils'
import readline from 'readline'

const readUserInput = (question: string) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise<string>((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer)
      rl.close()
    })
  })
}

const printBoard = (board: typeof boardState[keyof typeof boardState][][]) => {
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

const getStateSymbol = (cell: typeof boardState[keyof typeof boardState]) => {
  let symbol = '  '
  switch (cell) {
    case boardState.EMPTY:
      symbol = '□ '
      break
    case boardState.BLACK:
      symbol = '○ '
      break
    case boardState.WHITE:
      symbol = '● '
      break
    case boardState.CAN_PUT:
      symbol = '☆ '
      break
  }
  return symbol
}

const main = async () => {
  const othello = new Othello()
  while (!othello.getIsFinished()) {
    if (
      othello
        .getBoard()
        .flat()
        .filter((cell) => cell === boardState.CAN_PUT).length <= 0
    ) {
      othello.pass()
    }
    let input: Input = {
      x: -1,
      y: -1
    }
    while (true) {
      printBoard(othello.getBoard())
      const line = await readUserInput(`Where do you put ${getStateSymbol(othello.getTurn())} ? > `)
      const inputArr = line.split(' ')
      if (inputArr.length !== 2) {
        console.log('Input error')
        continue
      }
      input = {
        x: Number(inputArr[0]) - 1,
        y: Number(inputArr[1]) - 1
      }
      if (!othello.varifyInput(input)) {
        console.log('Input error')
        continue
      }
      console.log()
      break
    }
    othello.put(input)
    othello.endTurn()
  }
}

main()
