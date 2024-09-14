import {integer, varchar, pgTable, serial, text, timestamp,jsonb, boolean} from "drizzle-orm/pg-core"


export const User=pgTable('users',{
    id: serial('id').primaryKey(),
    email: varchar('email',{length:255}).notNull().unique()
    

})