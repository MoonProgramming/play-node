import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class SudokuComponent implements OnInit, OnDestroy {

  canvas: any = null;
  sketchHolder: HTMLElement | undefined;
  defaultSudokuSize: number = 415;
  thresholdSize: number = 437;
  sudokuInstance: any;
  constructor() { }

  ngOnInit(): void {
    this.sketchHolder = document.getElementById("sketch-holder") || undefined;
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
    this.sudokuInstance = new SudokuGenerator(this.defaultSudokuSize);
    this.canvas = new p5(this.sudokuInstance.sketch, this.sketchHolder);
    this.onResize();
  }

  genNewQuestion() {
    if (this.sketchHolder) {
      if (this.canvas) {
        this.canvas.remove();
        this.canvas = null;
      }
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
    if (window.visualViewport.width < this.thresholdSize) this.resizeCanvas(window.visualViewport.width * 92/100);
    else this.resizeCanvas(this.defaultSudokuSize);
  }

  ngOnDestroy() {
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
  }
}
