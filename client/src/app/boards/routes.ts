import { Route } from '@angular/router';

import { Board } from '../board/board';
import { TaskDialog } from '../task-dialog/task-dialog';

import { Boards } from './boards';

const BOARD_ROUTES: Route[] = [
  {
    path: '',
    component: Boards
  },
  {
    path: ':id',
    component: Board,
    children: [
      {
        path: 'tasks/:id',
        component: TaskDialog
      }
    ]
  }
];

export default BOARD_ROUTES;
