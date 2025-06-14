import { Route } from '@angular/router';

import { Board } from '../board/board';

import { Boards } from './boards';

const BOARD_ROUTES: Route[] = [
  {
    path: '',
    component: Boards
  },
  {
    path: ':id',
    component: Board
  }
];

export default BOARD_ROUTES;
