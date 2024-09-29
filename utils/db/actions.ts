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

export async function getUserByEmail(email: string) {
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
    // return transactions
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

export async function getAvailableRewards(userId: number) {
  try {
    console.log("Fetching available rewards for user:", userId);

    // Get user's total points
    const userTransactions = await getRewardTransactions(userId);
    const userPoints = userTransactions?.reduce((total, transaction) => {
      return transaction.type.startsWith("earned")
        ? total + transaction.amount
        : total - transaction.amount;
    }, 0);

    console.log("User total points:", userPoints);

    // Get available rewards from the database
    const dbRewards = await db
      .select({
        id: Rewards.id,
        name: Rewards.name,
        cost: Rewards.points,
        description: Rewards.description,
        collectionInfo: Rewards.collectionInfo,
      })
      .from(Rewards)
      .where(eq(Rewards.isAvailable, true))
      .execute();

    console.log("Rewards from database:", dbRewards);

    // Combine user points and database rewards
    const allRewards = [
      {
        id: 0, // Use a special ID for user's points
        name: "Your Points",
        cost: userPoints,
        description: "Redeem your earned points",
        collectionInfo: "Points earned from reporting and collecting waste",
      },
      ...dbRewards,
    ];

    console.log("All available rewards:", allRewards);
    return allRewards;
  } catch (error) {
    console.error("Error fetching available rewards:", error);
    return [];
  }
}

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
    const pointEarned = 10;
    // update reward Points
    await updateRewardPoints(userId, pointEarned);
    //create Transaction
    await createTransaction(
      userId,
      "earned_report",
      pointEarned,
      "Points earned for reporting"
    );
    //create Notification
    await createNotification(
      userId,
      `You've earned ${pointEarned} points for reporting waste!`,
      "reward"
    );
    return report;
  } catch (error) {
    console.error("Error while creating a Report", error);
    throw error;
  }
}

export async function updateRewardPoints(userId: number, pointsToAdd: number) {
  try {
    const [updatedReward] = await db
      .update(Rewards)
      .set({
        points: sql`${Rewards.points}+${pointsToAdd}`,
      })
      .where(eq(Rewards.userId, userId))
      .returning()
      .execute();
    return updatedReward;
  } catch (error) {
    console.log("Error while adding points to reward", error);
    return null;
  }
}

export async function createTransaction(
  userId: number,
  type: "earned_report" | "earned_collect" | "redeemed",
  amount: number,
  description: string
) {
  try {
    const [transaction] = await db
      .insert(Transactions)
      .values({
        userId,
        type,
        amount,
        description,
      })
      .returning()
      .execute();
    return transaction;
  } catch (error) {
    console.log("Error while creating transaction", error);
    throw error;
  }
}

export async function createNotification(
  userId: number,
  message: string,
  type: string
) {
  try {
    const [notification] = await db
      .insert(Notifications)
      .values({
        userId,
        message,
        type,
      })
      .returning()
      .execute();
    return notification;
  } catch (error) {
    console.error("Error while creating notifications", error);
  }
}

export async function getRecentReports(limit: number = 10) {
  try {
    const [reports] = await db
      .select()
      .from(Reports)
      .orderBy(desc(Reports.createdAt))
      .limit(limit)
      .execute();
    return reports;
  } catch (error) {
    console.error("Error while fetching recent reports", error);
  }
}

export async function getWasteCollectionTask(limit: number = 20) {
  try {
    const tasks = await db
      .select({
        id: Reports.id,
        location: Reports.location,
        wasteType: Reports.wasteType,
        amount: Reports.amount,
        status: Reports.status,
        date: Reports.createdAt,
        collectorId: Reports.collectorId,
      })
      .from(Reports)
      .limit(limit)
      .execute();

    return tasks.map((task: any) => {
      date: task.date.toISOString.split("T")[0];
    });
  } catch (error) {
    console.error("error while fecthcing collection waste", error);
    return [];
  }
}

export async function updateTaskStatus(
  reportId: number,
  newStatus: string,
  collectorId: number
) {
  try {
    const updateData: any = { status: newStatus };
    if (collectorId !== undefined) {
      updateData.collectorId = collectorId;
    }
    const [updateReport] = await db
      .update(Reports)
      .set(updateData)
      .where(eq(Reports.id, reportId))
      .returning()
      .execute();
    return updateReport;
  } catch (e) {
    console.error("Error while updating Tasks", e);
    throw e;
  }
}
export async function saveReward(userId: number, amount: number) {
  try {
    const [reward] = db
      .insert(Rewards)
      .values({
        userId,
        name: "Waste Collection Reward",
        collectionInfo: "Points earned from waste Collection",
        points: amount,
        isAvailable: true,
        level: 1,
      })
      .returning()
      .execute();
    await createTransaction(
      userId,
      "earned_collect",
      amount,
      "Points earned frome collecting waste!"
    );
    return reward;
  } catch (e) {
    console.error("Error while Saving Reward",e);
    throw e;
    
  }
}
