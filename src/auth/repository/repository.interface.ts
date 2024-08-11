/*eslint-disable */
import { User } from "@prisma/client";
import { SignUpDto } from "../dto";
import { UserResponse } from "./interfaces/UserResponse.interface";

export interface UserRepository {
    getByEmail(email: string): Promise<User | null>;
    createUser(data: SignUpDto): Promise<UserResponse>;
  }
  
  