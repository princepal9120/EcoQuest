import { eq } from "drizzle-orm";
import { db } from "./dbConfing";
import { Users } from "./schema";

export default async function createUser(email: string, name: string) {
  try {
    const [user] = await db
      .insert(Users)
      .values({ email, name })
      .returning()
      .execute();
    return user;
  } catch (error) {
    console.error("Error when creating user", error);
    return null;
  }
}

export async function getUserEmail(email: string) {
  try {
    const [user] = await db.select().from(Users).where(eq(Users.email, email)).execute();
    return user;
  } catch (error) {
    console.error("Error fetching user by email",error);
    
  }
}
