import { utcToZonedTime, format } from 'date-fns-tz';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

export default function isJSON(str: string): boolean {
    try {
        JSON.parse(str);
        return true;
    } catch (error) {
      console.log(error);
        return false;
    }
}

export function calculateDifferenceInSeconds(inputDate: Date): number {
    if (inputDate) {
        const inputDateTransformer = new Date(dayjs(inputDate).format('YYYY-MM-DD HH:mm:ss'));
        if (!inputDateTransformer) return 0
        // Obtener la fecha actual
        let currentDate = new Date(dayjs().format('YYYY-MM-DD HH:mm:ss'));
        
        //Saber la diferencia de horas entre la fecha actual y la fecha del registro que se va a analizar
        const hourDifference = inputDateTransformer.getHours() - currentDate.getHours();
        
        //Modificar la fecha actual con una nueva fecha ajustada con la diferencia de horarios
        //Esto es para que la fecha del servidor se ajuste a la fecha del registro porque es la correcta
        //de momento
        currentDate = new Date(currentDate.getTime() + hourDifference * 60 * 60 * 1000);

        const differenceInMilliseconds = Math.abs(currentDate.getTime() - inputDateTransformer.getTime());      
        
        console.log('Fecha del Servidor: ',currentDate);
        console.log('Fecha del Registro: ',inputDateTransformer);
        
        
        const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);
        return differenceInSeconds;
    }
  }


  export function getDateTimeZoneEcuador(date: Date = null): Date {
    if (date) {
        const fechaActual = date;
        const zonaHorariaEcuador = 'America/Guayaquil';
        const fechaEcuador = utcToZonedTime(fechaActual, zonaHorariaEcuador);
        return fechaEcuador;
    } else {
        const fechaActual = new Date();
        const zonaHorariaEcuador = 'America/Guayaquil';
        const fechaEcuador = utcToZonedTime(fechaActual, zonaHorariaEcuador);
        return fechaEcuador;
    }
  }

  export function getUploadPath(moduleName: string): string {
    // Puedes ajustar esta lógica para generar una estructura de carpetas personalizada
    const uploadPath = `uploads/${moduleName}/`;
    return uploadPath;
  }


export function generateUniqueFileName(): string {
    const uniqueId = uuidv4();
    return uniqueId;
  }

export function calcularPorcentaje(X: number, T: number) {
  if (T === 0) {
    return 0; // Evitar división por cero
  }

  return ((X / T) * 100).toFixed(2); //toFixed para redondear a dos lugares despues de la coma
}