import app from './src/app.js'
import { connectDatabase } from './src/config/db.js'
import { env } from './src/config/env.js'

async function bootstrap() {
  await connectDatabase()
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`)
  })
}

bootstrap().catch((error) => {
  console.error('Unable to start server', error)
  process.exit(1)
})
