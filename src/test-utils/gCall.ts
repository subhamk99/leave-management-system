import { graphql } from "graphql";
import { LeaveResolver } from "../resolvers/LeaveResolver";
import { UserResolver } from "../resolvers/UserResolver";
import { buildSchema } from "type-graphql";
import { Maybe } from "graphql/jsutils/Maybe";

interface Options{
    source:string;
    variableValues?:Maybe<{
        [key:string]:any
    }>
}
export const gCall = async({
    source,
    variableValues
}:Options) => {
        return graphql({
            schema: await buildSchema({
                resolvers: [UserResolver, LeaveResolver],
                dateScalarMode: "isoDate"
            }),
            source,
            variableValues
        });
    };