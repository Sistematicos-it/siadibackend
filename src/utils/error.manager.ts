import { HttpException, HttpStatus } from '@nestjs/common';
// Nota: la clasee error solo recibe un mensaje, por lo tanto en el constructor de la clase
// ErrorManager se le pasan dos atributos, uno que es el typo de error que vamos a notificar y el otro
// es el mensaje en si que recibe la clase error, como tenemos que referenciar el super() para poder heredar las fucionalidades
// de la clase Error pues en dicho super concatenamos el mensaje y haciendolo mas personalizado
// por lo tanto en la funcionalidad createSignatureError se recibe ya un mensaje que tambien va a tener el codigo del error
// y se geraran las exepciones de acuerdo al status pasado por parametro o en caso contrario un error interno de servidor
export class ErrorManager extends Error {
  constructor({
    type,
    message,
  }: {
    type: keyof typeof HttpStatus;
    message: string;
  }) {
    super(`${type} :: ${message}`);
  }

  public static createSignatureError(message: string) {
    const status = message?.split(' :: ')[0];
    const fields = message?.split(' :: ')[2];

    console.log(message)
    

    if (fields) {
      const field_arr = fields.split('/');

      let final_field_arr = [];

      field_arr.forEach((field) => {
        final_field_arr.push({
          property: field.split('#')[0],
          message: field.split('#')[1],
        });
      });

      throw new HttpException(
        {
          statusCode: HttpStatus[status],
          error: message.split(' :: ')[1],
          message: final_field_arr,
        },
        HttpStatus[status],
      );
    }

    if (status && message?.split(' :: ').length > 1) {
      throw new HttpException(
        {
          error: message,
          statusCode: HttpStatus[status],
          message: message.split(' :: ')[1],
        },
        HttpStatus[status],
      );
    } else {
      throw new HttpException(
        { error: "Error interno del servidor", statusCode: HttpStatus.INTERNAL_SERVER_ERROR },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
