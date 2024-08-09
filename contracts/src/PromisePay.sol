// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Promise.sol";

contract PromisePay {

    mapping(uint256 => address) public promises;
    uint256 public promiseCount;

    event PromiseCreated(uint256 indexed promiseId, address promiseAddress);

    function createPromise(
        PromiseInfo memory _promiseData,
        IWorldID _worldId,
        string memory _appId
    ) external {
        Promise newPromise = new Promise(
            _promiseData,
            _worldId,
            _appId
        );
        promises[promiseCount] = address(newPromise);
        emit PromiseCreated(promiseCount, address(newPromise));
        promiseCount++;
    }
}