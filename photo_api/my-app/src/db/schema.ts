import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { nanoid } from 'nanoid'
import * as z from 'zod'

export const tasks = sqliteTable('tasks', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  done: integer('done', { mode: 'boolean' }).notNull().default(false),
  // createAt: integer('created_at', { mode: 'timestamp' }).default(
  //   sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`
  // ),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  // createdAt: integer('created_at', { mode: 'timestamp' }).default(
  //   sql`(unixepoch())`
  // ),
  // updatedAt: integer('updated_at', { mode: 'timestamp' })
  //   .default(sql`(unixepoch())`)
  //   .$onUpdateFn(() => sql`(unixepoch())`),
  // createdAt: text('created_at')
  //   .notNull()
  //   .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
})
export type tasksType = typeof tasks
export const selectTasksSchema = createSelectSchema(tasks)
// export type selectTasksSchemaType = z.infer<typeof selectTasksSchema>

export const insertTasksSchema = createInsertSchema(tasks, {
  name: (schema) => schema.min(1).max(500),
})
  .required({
    done: true,
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
// export type insertTasksSchemaType = z.infer<typeof insertTasksSchema>

export const patchTasksSchema = insertTasksSchema.partial()
// export type patchTasksSchemaType = z.infer<typeof patchTasksSchema>

//login
export const users = sqliteTable('users', {
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  token: text('token'),
  avatar: text('avatar').notNull().default('orangelckc'),
  email: text('email').notNull().default('123@gmail.com'),
})

export const loginSchema = z.object({
  username: z.string().min(5),
  password: z.string(),
})
export const userInfoSchema = createSelectSchema(users).omit({
  password: true,
  token: true,
})
export const tokenSchema = z.object({
  token: z.string(),
})
export const usernameSchema = z.object({
  username: z.string(),
})
export type loginSchemaType = typeof loginSchema
export const registerSchema = createInsertSchema(users)
  .required({
    username: true,
    password: true,
    email: true,
  })
  .omit({ token: true, avatar: true })
export const selectUserInfoSchema = createSelectSchema(users)
export const insertUserInfoSchema = createInsertSchema(users).omit({
  token: true,
  username: true,
})
export const patchUserInfoSchema = insertUserInfoSchema.partial()

//bubu
export const bubu = sqliteTable('bubu', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => nanoid(10)),
  name: text('name').notNull(),
  tags: text('tags').notNull(),
  source: text('source').notNull(),
  category: integer('category').notNull(),
})
export const yier = sqliteTable('yier', {
  id: text('id').notNull().primaryKey().default(nanoid(10)),
  name: text('name').notNull(),
  tags: text('tags'),
  source: text('source').notNull(),
  category: integer('category').notNull().default(2),
})

export const selectPhotoSchema = createSelectSchema(bubu)
  .transform((data) => ({
    ...data,
    tags: JSON.parse(data.tags),
  }))

export const insertPhotoSchema = z.object({
  name: z.string().min(1),
  source: z.string().min(1),
  category: z.number().min(1),
  tags: z.array(z.string()).min(1),
})

export const uploadImageFileSchema=z.object({
  file:z.instanceof(File).refine((file) => {
    return file.size <= 2 * 1024 * 1024
  })
})

export const uploadImageFileResultSchema=z.object({
 size:z.number()
})
export const ImageIdParamsSchema = z.object({
  id: z.string().length(10),
})

export const keywordParamsSchema = z.object({
  keyword: z.string(),
})

// export const updatePhotoSchema = createInsertSchema(bubu)
//   .partial()
//   .omit({ category: true })
// export const patchImageInfoSchema = insertPhotoSchema.partial()
export const patchImageInfoSchema =z.object({
  name:z.string().min(1),
  tags:z.array(z.string()).min(1),
  source:z.string().min(1),
  category:z.number().min(1),
  id:z.string().length(10),
})
