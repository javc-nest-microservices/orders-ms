import 'dotenv/config'
import * as joi from 'joi'

interface IEnv {
  PORT: number
  DATABASE_URL: string
  NATS_SERVERS: string[]
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required()
  })
  .unknown(true)

const { error, value } = envSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
})

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const envVars: IEnv = value

export const envs = {
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,
  natsServers: envVars.NATS_SERVERS
}
