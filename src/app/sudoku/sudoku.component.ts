import { Component, OnInit } from '@angular/core';
import * as p5 from 'p5';
import { SudokuGenerator } from './sudokuGenerator';
// import * as p5sound from 'p5/lib/addons/p5.sound';
// import "p5/lib/addons/p5.sound.d";
// import "p5/lib/addons/p5.dom.d";

@Component({
  selector: 'app-sudoku',
  templateUrl: './sudoku.component.html',
  styleUrls: ['./sudoku.component.scss']
})
export class SudokuComponent implements OnInit {

  sketchHolder: HTMLElement | undefined;
  sudokuSize: number = 540;
  sudokuInstance: any;
  constructor() { }

  ngOnInit(): void {
    this.sketchHolder = document.getElementById("sketch-holder") || undefined;
    this.sudokuInstance = new SudokuGenerator(this.sudokuSize);
    let canvas = new p5(this.sudokuInstance.sketch, this.sketchHolder);
  }

  genNewQuestion() {
    if (this.sketchHolder) {
      this.sketchHolder.innerHTML = "";
      this.sudokuInstance = new SudokuGenerator(this.sudokuSize);
      let canvas = new p5(this.sudokuInstance.sketch, this.sketchHolder);
    }
  }

  resetQuestion() {
    this.sudokuInstance.resetQuestion();
  }

  showAnswer() {
    this.sudokuInstance.showAnswer();
  }

  hintNextStep() {
    this.sudokuInstance.hintNextStep();
  }
}
