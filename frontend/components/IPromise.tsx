export interface IReward {
    tokenAddress: string;
    tokenType: RewardTokenType;
    amount: number;
    distributionType: RewardDistributionType;
}

export enum RewardTokenType {
    BaseToken = "BaseToken",
    ERC20 = "ERC20"
}

export enum RewardDistributionType {
    Pool = "Pool"
}

export enum PromiseType {
    Online = "Online",
    Offline = "Offline"
}

export interface IPromiseData {
    host: string;
    title: string;
    periodST: number;
    periodEnd: number;
    promiseType: PromiseType;
    location: string;
    depositRequiredAmount: string;
    depositRequired: boolean;
    depositReturn: boolean;
    rewardIncluded: boolean;
    reward: IReward;
}
