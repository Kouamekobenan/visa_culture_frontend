export class Prize{
    constructor(
        public readonly id:string,
        public title:string,
        public description:string,
        public imageUrl:string,
        public lotteryId:string
    ){}
}

export interface CreatePrizeDTO {
  title: string;
  description: string;
  imageUrl: string;
  lotteryId: string;
}