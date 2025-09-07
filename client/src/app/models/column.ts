export type Column = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  boardId: string;
};

export type ColumnReorderUpdate = {
  id: string;
  order: number;
};
