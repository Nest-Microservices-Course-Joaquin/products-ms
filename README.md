## Dev

1. Clonar el repositorio
2. Instalar dependencias
3. Crear un archivo `.env` basado en el `.env.template`
4. Ejecutar migración de prisma con `pnpx prisma migrate dev`
5. Levantar el servidor de Nats

```
docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats
```

6. Ejecutar `pnpm run start:dev`
