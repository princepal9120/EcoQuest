import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "./dbConfig";
import { Notifications, Reports, Rewards, Transactions, Users } from "./schema";
import { date } from "drizzle-orm/mysql-core";

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
    const [user] = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email))
      .execute();
    return user;
  } catch (error) {
    console.error("Error fetching user by email", error);
  }
}

export async function getUnreadNotifications(userId: number) {
  try {
    return await db
      .select()
      .from(Notifications)
      .where(
        and(eq(Notifications.userId, userId), eq(Notifications.isRead, false))
      )
      .execute();
  } catch (error) {
    console.error("Error while fetching unread notifications", error);
  }
}

export async function getUserBalance(userId: number): Promise<number> {
  const transactions = (await getRewardTransactions(userId)) || [];
  if (!transactions) return 0;
  const balance = transactions.reduce((acc, transaction: any) => {
    return transaction.type.startWith("earned")
      ? acc + transaction.amount
      : acc - transaction.amount;
  }, 0);
  return Math.max(balance, 0);
}

export async function getRewardTransactions(userId: number) {
  try {
    const transactions = await db
      .select({
        id: Transactions.id,
        type: Transactions.type,
        amount: Transactions.amount,
        description: Transactions.description,
        date: Transactions.date,
      })
      .from(Transactions)
      .where(eq(Transactions.id, userId))
      .orderBy(desc(Transactions.date))
      .limit(10)
      .execute();
    //   return transactions
    const formattedTransactions = transactions.map((t) => ({
      ...t,
      date: t.date.toISOString().split("T")[0], //YYYY-MM-DD
    }));
    console.log(date);
    return formattedTransactions;
  } catch (error) {
    console.error("Error while fetching reward Transactions", error);
    return null;
  }
}
// mark notification functions

export async function markNotificationAsRead(notificationId: number) {
  try {
    await db
      .update(Notifications)
      .set({ isRead: true })
      .where(eq(Notifications.id, notificationId))
      .execute();
  } catch (error) {
    console.error("Error while Notification as REad", error);
  }
}

export async function createReport(
  userId: number,
  location: string,
  wasteType: string,
  amount: string,
  imageUrl?: string,
  verificationResult?: any
) {
  try {
    const [report] = await db
      .insert(Reports)
      .values({
        userId,
        location,
        wasteType,
        amount,
        imageUrl,
        verificationResult,
        status: "pending",
      })
      .returning()
      .execute();
      cosnt pointEarned=10;
      // update reward Points
      //create Transaction
      //create Notification
  } catch (error) {

  }
}I
export async function updateRewardPoints(userId:number, pointsToAdd : number)   {
   try {
    const [ updatedReward]= await db.update(Rewards).set({
      points: sql`${Rewards.points}+${pointsToAdd}`
    }).where(eq(Rewards.userId,userId)).returning().execute();
    return updatedReward;
   } catch (error) {
    console.log("Error while adding points to reward",error)
    return null;
   }

  
}


