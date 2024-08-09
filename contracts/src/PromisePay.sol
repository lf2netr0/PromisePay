// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Promise.sol";

contract PromisePay {
    struct PromiseData {
        string title;
        uint256 period;
        PromiseType promiseType;
        string location;
        uint256 depositRequiredAmount;
        bool depositRequired;
        bool rewardIncluded;
        address rewardTokenAddress;
        RewardTokenType rewardTokenType;
        uint256 rewardAmount;
        RewardDistributionType rewardDistributionType;
    }

    mapping(uint256 => address) public promises;
    uint256 public promiseCount;

    event PromiseCreated(uint256 indexed promiseId, address promiseAddress);

    function createPromise(
        PromiseData memory _promiseData
    ) external {
        Promise newPromise = new Promise(
            msg.sender,
            _promiseData.title,
            _promiseData.period,
            _promiseData.promiseType,
            _promiseData.location,
            _promiseData.depositRequiredAmount,
            _promiseData.depositRequired,
            _promiseData.rewardIncluded,
            _promiseData.rewardTokenAddress,
            _promiseData.rewardTokenType,
            _promiseData.rewardAmount,
            _promiseData.rewardDistributionType
        );
        promises[promiseCount] = address(newPromise);
        emit PromiseCreated(promiseCount, address(newPromise));
        promiseCount++;
    }
}
