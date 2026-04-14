export class Prize{
    constructor(
        public readonly id:string,
        public title:string,
        public description:string,
        public imageUrl:string,
        public lotterId:string
    ){}
}