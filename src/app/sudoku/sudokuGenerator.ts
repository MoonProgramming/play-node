export class SudokuGenerator {

  size: number;
  answerArray: string[][] = [];
  sudokuQuestion: any;
  numOfChoice: string[] = [];
  isModifyEnabled = false;
  modifyX: any;
  modifyY: any;
  fixedCoordinate: any[][] = [];

  constructor(size: number) {
    this.size = size;
  }

  sketch = (s: any) => {
    s.preload = () => {
      this.answerArray = this.generateNewSudoku(s);
      this.sudokuQuestion = this.answerArray.map(function (arr) {
        return arr.slice();
      });
      this.createQuestion2(s);
    }
    s.setup = () => {
      s.createCanvas(this.size, this.size);
    };
    s.draw = () => {
      this.createSudokuFrame(s);
      this.enableGreyHover(s);

      if (this.isModifyEnabled) {
        s.fill(100);
        let boxSize: number = this.size / 9;
        s.square(this.modifyX * boxSize, this.modifyY * boxSize, boxSize);
      }
      this.showSudoku(s);
    };
    s.mousePressed = (() => {
      this.isModifyEnabled = false;
      if (s.mouseX > 0 && s.mouseX < this.size && s.mouseY > 0 && s.mouseY < this.size) {
        let boxSize: number = this.size / 9;
        this.modifyX = Math.floor(s.mouseX / boxSize);
        this.modifyY = Math.floor(s.mouseY / boxSize);
        if (!this.isFixedCoordinate(this.modifyX, this.modifyY)) {
          this.isModifyEnabled = true;
          this.hideIfAllowed(this.modifyY, this.modifyX);
          this.sudokuQuestion[this.modifyY][this.modifyX] = '';
        }
      }
    });
    s.keyTyped = () => {
      if (s.key === 'c') {
        this.sudokuQuestion[this.modifyY][this.modifyX] = '';
        this.fixedCoordinate = this.fixedCoordinate.filter((x: any[]) => !(x[0] === this.modifyY && x[1] === this.modifyX));
      } else {
        let num = s.key;
        if (this.isModifyEnabled && this.numOfChoice.includes(num)) {
          this.sudokuQuestion[this.modifyY][this.modifyX] = num;
          this.isModifyEnabled = false;
        }
        this.checkResult();
      }
      // uncomment to prevent any default behavior
      return false;
    }
  }

  generateNewSudoku(s: any) {
    // initialize array
    this.answerArray = [];
    for (let i = 0; i < 9; i++) {
      this.answerArray[i] = [];
      for (let j = 0; j < 9; j++)
        this.answerArray[i][j] = '-';
    }

    // start populating
    let positionHistory: any[] = [];
    let availablePositionHistory: any[] = [];
    let count: number = 0;
    let isBackTracking: boolean = false;

    // initiate and randomize 1-9
    // TODO
    this.numOfChoice = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];


    for (let h = 0; h < this.numOfChoice.length; h++) {
      let numberToFill = this.numOfChoice[h];
      let i = 0;
      if (isBackTracking) i = 8;
      else {
        positionHistory[h] = [];
        availablePositionHistory[h] = [];
      }

      for (; i < this.answerArray.length; i++) {
        if (count > 2000) return this.answerArray;
        let availablePosition = [];

        if (isBackTracking) {
          availablePosition = availablePositionHistory[h][i];
        } else {
          for (let j = 0; j < this.answerArray[i].length; j++) {
            if (this.answerArray[i][j] === '-' && this.fitSudokuRules(numberToFill, i, j))
              availablePosition.push(j);
          }
          availablePositionHistory[h][i] = availablePosition;
        }

        if (availablePosition.length === 0) {

          if (i === 0) {
            // 1. erase previous numberToFill from last row
            let index = this.answerArray[8].indexOf(this.numOfChoice[h - 1]);
            if (index !== -1) {
              this.answerArray[8][index] = '-';
            }

            // 2.pop previousPosition out from positionHistory
            let previousPosition = positionHistory[h - 1].pop();

            // 3.eliminate wrong path
            availablePositionHistory[h - 1][8] = availablePositionHistory[h - 1][8].filter((e: any) => e !== previousPosition);

            // 4. backtracking = on
            isBackTracking = true;
            h -= 2;
            count++;

            break;
          }

          // 1.erase numberToFill from previous row
          let index = this.answerArray[i - 1].indexOf(numberToFill);
          if (index !== -1) {
            this.answerArray[i - 1][index] = '-';
          }

          // 2.pop previousPosition out from positionHistory
          let previousPosition = positionHistory[h].pop();

          // 3.eliminate wrong path
          availablePositionHistory[h][i - 1] = availablePositionHistory[h][i - 1].filter((e: any) => e !== previousPosition);

          // 4. backtracking = on
          isBackTracking = true;
          i -= 2;
          count++;

        } else {
          let positionChoice = s.random(availablePosition);
          this.answerArray[i][positionChoice] = numberToFill;
          positionHistory[h].push(positionChoice);
          isBackTracking = false;
        }
      }
    }
    return this.answerArray;
  }

  private createQuestion1(s: any) {

    this.sudokuQuestion.forEach((array: string[], indexX: any) => {
      array.forEach((element: string, indexY: any) => {
        if (element !== '') this.fixedCoordinate.push([indexX, indexY]);
      })
    });

    // test 0,0
    let currentPosition = [0, 0];
    let isGoingHori = true;
    let excludePositionList: number[][] = [];
    let positionList: any[] = [];
    for (let i = 0; i < 1000; i++) {
      if (this.hideIfAllowed(currentPosition[0], currentPosition[1])) {
        this.fixedCoordinate = this.fixedCoordinate.filter(x => !(x[0] === currentPosition[0] && x[1] === currentPosition[1]));
        if (isGoingHori) {
          positionList = this.findPositionCandidate(currentPosition[0], 'horizontal');
          isGoingHori = false;
        } else {
          positionList = this.findPositionCandidate(currentPosition[1], 'vertical');
          isGoingHori = true;
        }
        positionList = positionList.filter(x => {
          return !excludePositionList.some(y => y[0] === x[0] && y[1] === x[1]);
        });

        if (positionList.length > 0) {
          currentPosition = s.random(positionList);
        } else {
          // console.log(i);
          break;
        }
      } else {
        excludePositionList.push(currentPosition);
        if (isGoingHori) {
          positionList = this.findPositionCandidate(currentPosition[1], 'vertical');
        } else {
          positionList = this.findPositionCandidate(currentPosition[0], 'horizontal');
        }
        positionList = positionList.filter(x => {
          return !excludePositionList.some(y => y[0] === x[0] && y[1] === x[1]);
        });

        if (positionList.length > 0)
          currentPosition = s.random(positionList);
        else {
          // console.log(i);
          break;
        }
      }
    }
  }

  private createQuestion2(s: any) {

    let rowToChooseForEachNum = [];
    // for each numOfChoice, random choose row to hide x9
    for (let h = 0; h < this.numOfChoice.length; h++) {
      let rowToChoose: number[] = this.numOfChoice.map(x => +(x) - 1);
      rowToChooseForEachNum.push(rowToChoose);
      let numToHide = this.numOfChoice[h];

      // 1. get random coordinate x8 7=easy
      for (let i = 0; i < 8; i++) {
        let randomRow = s.random(rowToChoose);
        rowToChoose = rowToChoose.filter(x => x !== randomRow);
        let indexY = this.sudokuQuestion[randomRow].findIndex((x: string) => x === numToHide);

        this.hideIfAllowed(randomRow, indexY);
      }
    }

    this.sudokuQuestion.forEach((array: any[], indexX: any) => {
      array.forEach((element, indexY) => {
        if (element !== '') this.fixedCoordinate.push([indexX, indexY]);
      })
    });
  }

  showSudoku(s: any) {
    s.fill(0);
    let yAxisPoint = this.size / 12;
    s.textSize(this.size / 15.4); // 35 in 540
    for (let i = 0; i < 9; i++) {
      let xAxisPoint = this.size / 27; // 20
      for (let j = 0; j < 9; j++) {
        if (this.isFixedCoordinate(j, i)) {
          s.fill(0);
          s.textStyle(s.BOLDITALIC);
        } else {
          s.fill(88);
          s.textStyle(s.NORMAL);
        }
        s.text(this.sudokuQuestion[i][j], xAxisPoint, yAxisPoint);
        xAxisPoint += this.size / 9;
      }
      yAxisPoint += this.size / 9;
    }
  }

  resetQuestion() {
    this.sudokuQuestion = this.answerArray.map(function(arr) {
      return arr.slice();
    });
    for (let i=0; i<this.sudokuQuestion.length; i++) {
      for (let j=0; j<this.sudokuQuestion.length; j++) {
        if (!this.isFixedCoordinate(i, j)) this.sudokuQuestion[j][i] = '';
      }
    }
  }

  showAnswer() {
    this.sudokuQuestion = this.answerArray.map(function(arr) {
      return arr.slice();
    });
  }

  hintNextStep() {
    for (let i=0; i<this.sudokuQuestion.length; i++) {
      for (let j=0; j<this.sudokuQuestion.length; j++) {
        if (this.sudokuQuestion[i][j] === '') {
          let sss = this.findPossibilityByCoor(i, j);
          if (sss?.length === 1) this.sudokuQuestion[i][j] = sss[0];
        }
      }
    }
  }


  private fitSudokuRules(randomNum: string, xPoint: number, yPoint: number) {
    if (this.answerArray[xPoint].some(x => x === randomNum))
      return false;

    let verticalArray = [];
    for (let i = 0; i < xPoint; i++) {
      verticalArray.push(this.answerArray[i][yPoint]);
    }
    if (verticalArray.length && verticalArray.some(x => x === randomNum))
      return false;

    let boxArray = [];
    let i = Math.floor(xPoint / 3) * 3;
    let xEnd = i + 2;
    for (; i <= xEnd; i++) {
      let j = Math.floor(yPoint / 3) * 3;
      let yEnd = j + 2;
      for (; j <= yEnd; j++) {
        if (this.answerArray[i] && this.answerArray[i][j])
          boxArray.push(this.answerArray[i][j]);
      }
    }
    if (boxArray.length && boxArray.some(x => x === randomNum))
      return false;

    return true;
  }

  private findPositionCandidate(index: number, axis: string) {
    let positionCandidates = [];
    if (axis === 'horizontal') {
      this.sudokuQuestion[index].forEach((x: string, indexY: any) => {
        if (x !== '') positionCandidates.push([index, indexY]);
      });
    } else if (axis === 'vertical') {
      for (let i = 0; i < 9; i++) {
        if (this.sudokuQuestion[i][index] !== '') positionCandidates.push([i, index]);
      }
    }
    return positionCandidates;
  }

  private hideIfAllowed(randomX: number, randomY: number) {
    let numberToHide = this.sudokuQuestion[randomX][randomY];
    this.sudokuQuestion[randomX][randomY] = '';

    // 1.0 hide if itself is the only choice
    if (this.findPossibilityByCoor(randomX, randomY)?.length === 1) return true;

    // 1.1 horizontal, for each blank, get their available choices, put in one array
    let horizontalPossibility: (any[] | undefined)[] = [];
    this.sudokuQuestion[randomX].forEach((element: string, index: number) => {
      if (element === '')
        horizontalPossibility.push(this.findPossibilityByCoor(randomX, index));
    });
    // console.log(horizontalPossibility);
    let test1 = horizontalPossibility.slice(0);
    this.filterPossibilities(test1);
    this.filterPossibilities(test1);
    // console.log(test1);
    if (!this.appearMoreThanOnce(test1.flat(), numberToHide)) return true;

    // 1.2 vertical, for each blank, get their available choices, put in one array
    let verticalPossibility = [];
    for (let i = 0; i < 9; i++) {
      if (this.sudokuQuestion[i][randomY] === '')
        verticalPossibility.push(this.findPossibilityByCoor(i, randomY));
    }
    // console.log(verticalPossibility);
    let test2 = verticalPossibility.slice(0);
    this.filterPossibilities(test2);
    this.filterPossibilities(test2);
    // console.log(test2);
    if (!this.appearMoreThanOnce(test2.flat(), numberToHide)) return true;

    // 1.3 box, for each blank, get their available choices, put in one array
    let boxPossibility = [];
    let i = Math.floor(randomX / 3) * 3;
    let xEnd = i + 2;
    for (; i <= xEnd; i++) {
      let j = Math.floor(randomY / 3) * 3;
      let yEnd = j + 2;
      for (; j <= yEnd; j++) {
        if (this.sudokuQuestion[i][j] === '')
          boxPossibility.push(this.findPossibilityByCoor(i, j));
      }
    }
    // console.log(boxPossibility);
    let test3 = boxPossibility.slice(0);
    this.filterPossibilities(test3);
    this.filterPossibilities(test3);
    // console.log(test3);
    if (!this.appearMoreThanOnce(test3.flat(), numberToHide)) return true;

    this.sudokuQuestion[randomX][randomY] = numberToHide;
    return false;
  }

  private findPossibilityByCoor(xCoor: number, yCoor: number) {
    let choicesArray: any[][] = [];
    // 1.1 horizontal choices
    let horizontalChoices = this.numOfChoice.filter(x => !this.sudokuQuestion[xCoor].includes(x));
    choicesArray.push(horizontalChoices);

    // 1.2 vertical choices
    let verticalArray: string[] = [];
    for (let i = 0; i < 9; i++) {
      verticalArray.push(this.sudokuQuestion[i][yCoor]);
    }
    let verticalChoices = this.numOfChoice.filter(x => !verticalArray.includes(x));
    choicesArray.push(verticalChoices);

    // 1.3 box choices
    let boxArray: string[] = [];
    let i = Math.floor(xCoor / 3) * 3;
    let xEnd = i + 2;
    for (; i <= xEnd; i++) {
      let j = Math.floor(yCoor / 3) * 3;
      let yEnd = j + 2;
      for (; j <= yEnd; j++) {
        if (this.sudokuQuestion[i] && this.sudokuQuestion[i][j])
          boxArray.push(this.sudokuQuestion[i][j]);
      }
    }
    let boxChoices = this.numOfChoice.filter(x => !boxArray.includes(x));
    choicesArray.push(boxChoices);

    // return an array that have common element
    let result = choicesArray.shift()?.filter(function (v) {
      return choicesArray.every(function (a) {
        return a.indexOf(v) !== -1;
      });
    });
    // console.log(result);
    return result;
  }

  // if one, cancel, if 2 same cancel 2 num, if 3 same cancel 3 num
  private filterPossibilities(possiblityArray: any[]) {
    let theUnique: any[] = [];
    possiblityArray.forEach(x => {
      if (x.length === 1) theUnique.push(x[0]);
    });
    // filter theUnique
    for (let i = 0; i < possiblityArray.length; i++) {
      if (possiblityArray[i].length > 1) possiblityArray[i] = possiblityArray[i].filter((y: any) => !theUnique.includes(y));
    };

    let theTwin: any[] = [];
    for (let i = 0; i < possiblityArray.length; i++) {
      if (possiblityArray[i].length === 2) {
        for (let j = i + 1; j < possiblityArray.length; j++) {
          if (this.arraysEqual(possiblityArray[j], possiblityArray[i])) {
            theTwin.push(possiblityArray[i]);
          }
        }
      }
    }
    for (let i = 0; i < possiblityArray.length; i++) {
      for (let j = 0; j < theTwin.length; j++) {
        if (!this.arraysEqual(possiblityArray[i], theTwin[j])) {
          possiblityArray[i] = possiblityArray[i].filter((y: any) => {
            if (theTwin[j].includes(y)) return false;

            return true;
          });
        }
      }
    };

    let theTriplet: any[] = [];
    for (let i = 0; i < possiblityArray.length; i++) {
      if (possiblityArray[i].length === 3) {
        for (let j = i + 1; j < possiblityArray.length; j++) {
          if (this.arraysEqual(possiblityArray[j], possiblityArray[i])) {
            for (let k = j + 1; k < possiblityArray.length; k++) {
              if (this.arraysEqual(possiblityArray[k], possiblityArray[j])) {
                theTriplet.push(possiblityArray[i]);
              }
            }
          }
        }
      }
    }
    for (let i = 0; i < possiblityArray.length; i++) {
      for (let j = 0; j < theTriplet.length; j++) {
        if (!this.arraysEqual(possiblityArray[i], theTriplet[j])) {
          possiblityArray[i] = possiblityArray[i].filter((y: any) => {
            if (theTriplet[j].includes(y)) return false;

            return true;
          });
        }
      }
    };
  }

  private isFixedCoordinate(axisX: number, axisY: number) {
    for (let i = 0; i < this.fixedCoordinate.length; i++) {
      if (this.fixedCoordinate[i][0] === axisY && this.fixedCoordinate[i][1] === axisX)
        return true;
    }
    return false;
  }

  private createSudokuFrame(s: any) {
    s.background(255);
    s.fill(0);
    let xAxisPoint = 0;
    let yAxisPoint = 0;
    for (let i = 0; i < 10; i++) {
      if (i % 3 === 0)
        s.strokeWeight(3);
      else
        s.strokeWeight(1);
      s.line(xAxisPoint, 0, xAxisPoint, this.size);
      s.line(0, yAxisPoint, this.size, yAxisPoint);
      xAxisPoint += this.size / 9;
      yAxisPoint += this.size / 9;
    }
  }

  private enableGreyHover(s: any) {
    s.strokeWeight(1);
    s.fill(225);
    let boxSize: number = this.size / 9;
    let axisX = Math.floor(s.mouseX / boxSize);
    let axisY = Math.floor(s.mouseY / boxSize);
    for (let i = 0; i <= this.size; i += boxSize) {
      for (let j = 0; j <= this.size; j += boxSize) {
        if (s.mouseX < this.size && s.mouseY < this.size) {
          if ((s.mouseX > i && s.mouseX < i + boxSize) && (s.mouseY > j && s.mouseY < j + boxSize)) {
            if (!this.isFixedCoordinate(axisX, axisY))
              s.square(i, j, boxSize);
          }
        }
      }
    }
  }

  private checkResult() {
    let sudokuComplete = true;
    let allBoxesFilled = true;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (!this.numOfChoice.includes(this.sudokuQuestion[i][j])) allBoxesFilled = false;
        if (this.sudokuQuestion[i][j] !== this.answerArray[i][j]) sudokuComplete = false;
      }
    }
    if (allBoxesFilled && sudokuComplete) alert('well done!')
    else if (allBoxesFilled) alert('not correct');
  }

  private appearMoreThanOnce(arr: any[], element: any) {
    let count = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === element) count++;
      if (count > 1) return true;
    }
    return false;
  }

  private arraysEqual(arr1: any[], arr2: any[]) {
    if (arr1 instanceof Array && arr2 instanceof Array) {
      if (arr1.length != arr2.length)
        return false;
      for (var i = 0; i < arr1.length; i++)
        if (!this.arraysEqual(arr1[i], arr2[i]))
          return false;
      return true;
    } else {
      return arr1 == arr2;
    }
  }
}
