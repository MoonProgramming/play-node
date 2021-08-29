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

  canvas: any;
  sketchHolder: HTMLElement | undefined;
  defaultSudokuSize: number = 424;
  thresholdSize: number = 530;
  sudokuInstance: any;
  constructor() { }

  ngOnInit(): void {
    this.sketchHolder = document.getElementById("sketch-holder") || undefined;
    this.sudokuInstance = new SudokuGenerator(this.defaultSudokuSize);
    this.canvas = new p5(this.sudokuInstance.sketch, this.sketchHolder);
    this.onResize();
  }

  genNewQuestion() {
    if (this.sketchHolder) {
      this.sketchHolder.innerHTML = "";
      this.sudokuInstance = new SudokuGenerator(this.defaultSudokuSize);
      this.canvas = new p5(this.sudokuInstance.sketch, this.sketchHolder);
      this.onResize();
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

  resizeCanvas(size: number) {
    this.sudokuInstance.size = size;
    this.canvas.redraw();
  }

  onResize() {
    if (window.innerWidth < this.thresholdSize) this.resizeCanvas(window.innerWidth * 80/100);
    else this.resizeCanvas(this.defaultSudokuSize);
  }
}
