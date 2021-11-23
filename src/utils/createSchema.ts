import { buildSchema } from "type-graphql"
import { LeaveResolver } from "../resolvers/LeaveResolver"
import { UserResolver } from "../resolvers/UserResolver"

export const createSchema = ()=>{
    buildSchema({
        resolvers: [UserResolver, LeaveResolver],
        dateScalarMode:"isoDate"
    })
}