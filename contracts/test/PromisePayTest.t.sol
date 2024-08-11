// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/PromisePay.sol"; // Update with the actual path
import "../src/Promise.sol"; // Update with the actual path
import "./mocks/MockWorldID.sol";

import "@ethereum-attestation-service/eas-contracts/contracts/EAS.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/SchemaRegistry.sol";

contract PromisePayTest is Test {
    PromisePay promisePay;
    PromiseInfo promiseInfo;
    address worldId;
    string appId = "TestAppId";
    SchemaRegistry registry;
    EAS mockEas;
    bytes32 schema;

    function setUp() public {
        promisePay = new PromisePay();
        worldId = address(new MockWorldID()); // Assuming you have a mock for WorldID
        registry = new SchemaRegistry();
        mockEas = new EAS(registry);
        schema = registry.register('string Action,uint256[] Proof,uint256 Nullifier,address PromiseAddress,uint256 MerkleRoot', ISchemaResolver(address(0)), true);
        promiseInfo = PromiseInfo({
            host: address(this),
            title: "Test Promise",
            periodST: block.timestamp,
            periodEnd: block.timestamp,
            promiseType: PromiseType.Offline, // Assuming these are valid enums in Promise.sol
            location: "Test Location",
            depositRequiredAmount: 0.00001 ether,
            depositRequired: true,
            depositReturn: true,
            rewardIncluded: true,
            reward: Reward({
                tokenAddress: address(0x0), // Dummy token address
                tokenType: RewardTokenType.BaseToken,
                amount: 0,
                distributionType: RewardDistributionType.Pool
            })
        });
    }

    function testCreatePromise() public {
        // Track the transaction
        vm.startPrank(address(this));
        uint256 initialCount = promisePay.promiseCount();

        promisePay.createPromise(promiseInfo, worldId, address(mockEas), schema, appId);

        // Verify the Promise was created
        assertEq(promisePay.promiseCount(), initialCount + 1);

        address newPromiseAddress = promisePay.promises(initialCount);
        assertTrue(newPromiseAddress != address(0));

        // Emitting event testing
        // vm.expectEmit(true, true, true, true);
        // emit PromiseCreated(address(this), initialCount, newPromiseAddress);
        promisePay.createPromise(promiseInfo, worldId, address(mockEas), schema, appId);

        vm.stopPrank();
    }
}
