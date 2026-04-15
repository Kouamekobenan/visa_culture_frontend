import { Prize } from "../entities/prize.entity";

export interface IPrizeRepository{
    findPrizeRecent():Promise<Prize[]>
}