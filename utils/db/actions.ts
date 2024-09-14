import {db} from "./dbConfing"
import { Users } from "./schema";


export asynce function createUser(email: string, name: string){
    try {
        const [user]=await db.insert(Users).values({email,name}).returning().execute();
        return user;
    } catch (error) {
        console.error("Error when creating user",err);
        return null
    }
}