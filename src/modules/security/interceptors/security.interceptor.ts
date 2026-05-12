import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { SecurityLogsEntity } from '../entities/security.entity';
import { AppDS } from 'src/config';

export class SecurityInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map(({ data, pageNumber, pageLimit, totalElements, totalPages }) => {
        const response = data.map(async (item: SecurityLogsEntity) => {
          let _item = item;

          const entity_field = await AppDS.query(
            'SELECT * FROM $1 WHERE id = $2',
            [_item.entity, _item.entry_id],
          );

          delete _item.entry_id;

          const res = {
            ..._item,
            entity_field,
          };
          return res;
        });

        return {
          pageNumber,
          pageLimit,
          totalElements,
          totalPages,
          data: response,
        };
      }),
    );
  }
}
