import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import path from 'path'
import { z, ZodError } from 'zod'
expand(
  config({
    path: path.resolve(
      process.cwd(),
      process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
    ),
  })
)
const EnvSchema = z
  .object({
    NODE_ENV: z.string().default('development'),
    PORT: z.coerce.number().default(9999),
    LOG_LEVEL: z.enum([
      'fatal',
      'error',
      'warn',
      'info',
      'debug',
      'trace',
      'silent',
    ]),
    TURSO_DATABASE_URL: z.string().url(),
    TURSO_AUTH_TOKEN: z.string().optional(),
    SECRET: z.string(),
  })
  .superRefine((input, ctx) => {
    if (input.NODE_ENV === 'production' && !input.TURSO_AUTH_TOKEN) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_type,
        expected: 'string',
        received: 'undefined',
        path: ['TURSO_AUTH_TOKEN'],
        message: 'Must be set when NODE_ENV is production',
      })
    }
  })
//   .refine(
//     (input) => {
//       //生产环境时需要验证token
//       if (input.NODE_ENV === 'production') {
//         //检查token是否存在且非空
//         return !!input.TURSO_AUTH_TOKEN?.trim()
//       }
//       return true
//     },
//     {
//       message: '无效的 TURSO_AUTH_TOKEN',
//     }
//   )
export type env = z.infer<typeof EnvSchema>
let env: env
try {
  env = EnvSchema.parse(process.env)
  console.log(env)
} catch (e) {
  const error = e as ZodError
  console.log('Invalid env')
  console.log(error.flatten().fieldErrors)
  process.exit(1)
}
export default env
