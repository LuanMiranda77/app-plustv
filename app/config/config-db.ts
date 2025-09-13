// import { drizzle } from 'drizzle-orm/expo-sqlite';
// import * as SQLite from 'expo-sqlite';

// const expoDb = SQLite.openDatabaseSync('app.db');
// const db = drizzle(expoDb);

// // Definindo tabela
// import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// const users = sqliteTable('users', {
//   id: integer('id').primaryKey(),
//   name: text('name').notNull(),
//   avatar: text('avatar').notNull()
// });

// // Inserindo
// await db.insert(users).values({ name: 'Luan', avatar: 'avatar1.png' });

// // Buscando
// const allUsers = await db.select().from(users);
