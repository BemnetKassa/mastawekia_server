import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
  origin: "http://localhost:3001",
  credentials: true,
});

await app.listen(process.env.PORT ?? 3000, async() => {
    console.log(`Server is running on port ${await app.getUrl()}`);
  });
}
bootstrap();
