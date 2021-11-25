import { graphql, GraphQLSchema } from "graphql";
import { LeaveResolver } from "../resolvers/LeaveResolver";
import { UserResolver } from "../resolvers/UserResolver";
import { buildSchema } from "type-graphql";
import { Maybe } from "graphql/jsutils/Maybe";

interface Options{
    source:string;
    variableValues?:Maybe<{
        [key:string]:any
    }>,
    userId?:number
}
let schema:GraphQLSchema;
export const gCall = async({
    source,
    variableValues,
    userId
}:Options) => {
        if(!schema){
            schema = await buildSchema({
                resolvers: [UserResolver, LeaveResolver],
                dateScalarMode: "isoDate",
            })
        }
        return graphql({
            schema: schema,
            source,
            variableValues,
            contextValue: {
                req: {
                  session: {
                    userId
                  }
                },
                res: {
                  clearCookie: jest.fn()
                },
                payload:{userId: userId}
              }
        });
    };