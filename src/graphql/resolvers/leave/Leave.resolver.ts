import { Leave } from "../../../entity/Leave";
import { User } from "../../../entity/User";

module.exports = {
    Query:{
        async allLeaves(_parent: any,_args: any, _context: any, _info: any):Promise<Leave[]>{
            return await Leave.find();
        },
        
    },
    Mutation:{
        async cancelLeave(leave_id:number){
            return await Leave.delete({id:leave_id});
        },
        async updateLeave(_parent: any,{leave_id,leave_input}:any, _context: any, _info: any){
            return await Leave.update({id:leave_id},leave_input);
        },
        async applyLeave(_parent: any,{leave_input}: any, context: any, _info: any){

            const s_date:Date = new Date(leave_input.start_date);
            const e_date:Date = new Date(leave_input.end_date);
            leave_input.start_date= s_date;
            leave_input.end_date= e_date;

            if(leave_input.end_date<=leave_input.start_date){
                throw new Error("Minimum leave duration should be 1 day!")
            }
            
            const user = await User.findOne({where:{id:context.user.userId}});
            if(!user){
                throw new Error("User doesn't exist!!!")
            }
            
            const leave_duration =(leave_input.end_date.getDate()- leave_input.start_date.getDate());
            if(leave_duration> user.leave_balance){
                throw new Error("Insufficient leaves!!!")
            }
    
            user.leave_balance = user.leave_balance-leave_duration;
            await user.save();
    
            const leave = await new Leave();
            leave.start_date = leave_input.start_date;
            leave.end_date = leave_input.end_date;
            leave.status="pending";
            leave.user=Promise.resolve(user);
            await leave.save();
    
            return leave;
        },
    }
}