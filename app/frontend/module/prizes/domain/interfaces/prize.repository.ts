import { CreatePrizeDTO, Prize } from "../entities/prize.entity";

export interface IPrizeRepository{
    findPrizeRecent():Promise<Prize[]>
    create(dto: CreatePrizeDTO, file?: File | null):Promise<Prize>
} 