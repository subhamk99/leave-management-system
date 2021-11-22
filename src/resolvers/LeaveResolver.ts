import { Leave } from "../entity/Leave";
import { Arg, Ctx, Field, InputType, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql";
import { isAuthenticated } from "../Authenticate";
import { MyContext } from "src/config/MyContext";
import { User } from "../entity/User";

@InputType({description:"holds data for apply leave"})
class LeaveInput{
    @Field({nullable:false})
    start_date: Date;

    @Field({nullable:false})
    end_date:Date;
}
@InputType({description:"holds data for apply leave"})
class LeaveUpdateInput{
    @Field({nullable:true})
    start_date: Date;

    @Field({nullable:true})
    end_date:Date;

    @Field({nullable:true})
    status:'pending'|'approved'|'denied';
}

@ObjectType()
class LeaveResponse{
    @Field()
    start_date: Date;

    @Field()
    end_date:Date;

    @Field({nullable:false})
    status:"pending"|"approved"|'denied';
}

@Resolver()
export class LeaveResolver{

    // finds all leaves of the logged in user
    @Query(()=> [Leave])
    @UseMiddleware(isAuthenticated)
    async allLeaves(
        @Ctx() {payload}:MyContext
    ):Promise<Leave[]>{
        return Leave.find({where:{employee_id:payload?.userId}})
    }

    @Mutation(()=>LeaveResponse)
    @UseMiddleware(isAuthenticated)
    async applyLeave(
        @Arg("leave_input") leave_input:LeaveInput,
        @Ctx() {payload}:MyContext
    ):Promise<LeaveResponse | string>{
        if(leave_input.end_date<=leave_input.start_date){
            throw new Error("Minimum leave duration should be 1 day!")
        }

        const user = await User.findOne({where:{id:payload?.userId}});
        if(!user){
            throw new Error("User doesn't exist!!!")
        }

        const leave_duration =(leave_input.end_date.getDate()- leave_input.start_date.getDate());
        if(leave_duration> user.leave_balance){
            throw new Error("Insufficient leaves!!!")
        }

        const user_overlap_leaves = await Leave.find({
            where:{
                employee_id:user.id, 
                start_date:leave_input.start_date,
                end_date:leave_input.end_date
            }});

        if(user_overlap_leaves){
            throw new Error("Duplicate leave!!!");
        }

        user.leave_balance = user.leave_balance-leave_duration;
        await user.save();

        const leave = await new Leave();
        leave.start_date = leave_input.start_date;
        leave.end_date = leave_input.end_date;
        leave.status="pending";
        leave.user=Promise.resolve(user);
        leave.save();

        return leave;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuthenticated)
    async updateLeave(
        @Arg("leave_id", () => Int) leave_id: number,
        @Arg("leave_input", () => LeaveUpdateInput) leave_input: LeaveUpdateInput
    ) {
        await Leave.update({id:leave_id}, leave_input);
        return true;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuthenticated)
    async cancelLeave(@Arg("leave_id", () => Int) leave_id: number) {
        await Leave.delete({id:leave_id});
        return true;
    }
}