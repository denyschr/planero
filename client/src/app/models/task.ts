export type Task = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  boardId: string;
  columnId: string;
};
