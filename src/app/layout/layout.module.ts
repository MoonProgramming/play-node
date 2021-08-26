import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HomeComponent } from '../home/home.component';
import { SudokuComponent } from '../sudoku/sudoku.component';

const route: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'sudoku', component: SudokuComponent },
];

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
  ]
})
export class LayoutModule { }
