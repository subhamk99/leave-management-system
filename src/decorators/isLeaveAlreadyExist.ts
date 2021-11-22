// import {
//     registerDecorator,
//     ValidationOptions,
//     ValidatorConstraint,
//     ValidatorConstraintInterface,

// } from "class-validator";
// import { User } from "../entity/User";

// @ValidatorConstraint({async:true})
// export class IsLeaveAlreadyExistConstraint implements ValidatorConstraintInterface{
//     validate(start_date:Date){
//         // return Lea
//         return User.findOne({where:{email}}).then(user => {
//             if(user) return false;
//             return true;
//         })
//     }
// }

// export function IsLeaveAlreadyExist(validationOptions?: ValidationOptions){
//     return function(object:Object, propertyName:string){
//         registerDecorator({
//             target:object.constructor,
//             propertyName:propertyName,
//             options:validationOptions,
//             constraints:[],
//             validator:IsLeaveAlreadyExistConstraint
//         })
//     }
// }