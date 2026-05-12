import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { CourseEntity } from '../entities/course.entity';
import { format } from 'date-fns';

export class DateInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map(({ data, pageNumber, pageLimit, totalElements, totalPages }) => {
        const response = data.map((item: CourseEntity) => {
          let _item = item;

          let start_date: string = null;
          let end_date: string = null;

          if (item.start_date) {
            start_date = format(item.start_date.setDate(item.start_date.getDate() ), 'yyyy-MM-dd');
          }

          if (item.end_date) {
            end_date = format(item.end_date.setDate(item.end_date.getDate() ), 'yyyy-MM-dd');
          }

          delete _item.end_date;
          delete _item.start_date;

          const res = {
            ..._item,
            start_date,
            end_date,
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
