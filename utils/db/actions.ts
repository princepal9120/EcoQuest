import { and, eq } from "drizzle-orm";
import { db } from "./dbConfig
import { Notifications, Users } from "./schema";

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

export async function getByUserEmail(email: string) {
  try {
    const [user] = await db.select().from(Users).where(eq(Users.email, email)).execute();
    return user;
  } catch (error) {
    console.error("Error fetching user by email",error);
    
  }
}

export async function getUnreadNotifications(userId:number)   {
    try {
   return await db.select().from(Notifications).where(and(eq(Notifications.userId,userId), eq(Notifications.isRead,false))).execute();

    } catch (error) {
        console.error("Error while fetching unread notifications",error);
        
    }
    
}

export async function getUserBalance(userId:number) {
    try {
            
    } catch (error) {
        
    }
}
