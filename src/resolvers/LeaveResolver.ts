import { Leave } from "../entity/Leave";
import { Query, Resolver } from "type-graphql";

@Resolver()
export class LeaveResolver{

    @Query(()=> [Leave])
    async allLeaves():Promise<Leave[]>{
        return Leave.find()
    }

}