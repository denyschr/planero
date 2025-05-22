import { Response } from 'express';

export const sendUnauthorized = (response: Response, url: string, message = 'Unauthorized') => {
  return response.status(401).send({
    code: 401,
    message,
    url,
    success: false
  });
};

export const sendUnprocessableEntity = (
  response: Response,
  url: string,
  message = 'Unprocessable Entity'
) => {
  return response.status(422).send({
    code: 422,
    message,
    url,
    success: false
  });
};
