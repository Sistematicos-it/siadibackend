# Establecer la imagen base de NodeJS
# se cambió la version node:18.16.0-alpine por errores en el Build  -- --platform=linux/amd64  node:hydrogen-alpin3.18
FROM --platform=linux/amd64 node:18-alpine

#Configurar Zona Horaria
ENV TZ=America/Guayaquil

# Establecer el directorio de trabajo en la imagen
WORKDIR /app

# Copiar los archivos del proyecto a la imagen
COPY package.json package-lock.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar los archivos del proyecto a la imagen
COPY . .

# Compilar aplicación
RUN npm run build

# Exponer el puerto del servidor
EXPOSE 8000

# Iniciar el servidor de NestJS
CMD ["npm","run", "start:prod"]
