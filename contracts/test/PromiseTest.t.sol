// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/Promise.sol";
import "./mocks/MockWorldID.sol";
import "./mocks/MockERC20.sol";

contract PromiseTest is Test {
    MockWorldID public worldId;
    MockERC20 public rewardToken;
    Promise public promiseImpl;
    address public host;
    address public attendee;

    function setUp() public {
        // Deploy Mock Contracts
        worldId = new MockWorldID();
        rewardToken = new MockERC20("Reward Token", "RT", 1000 ether);

        // Set up PromiseInfo
        PromiseInfo memory promiseInfo = PromiseInfo({
            host: address(this),
            title: "Test Promise",
            periodST: block.timestamp,
            periodEnd: block.timestamp + 1 days,
            promiseType: PromiseType.Online,
            location: "https://example.com",
            depositRequiredAmount: 1 ether,
            depositRequired: true,
            depositReturn: true,
            rewardIncluded: true,
            reward: Reward({
                tokenAddress: address(rewardToken),
                tokenType: RewardTokenType.ERC20,
                amount: 100 ether,
                distributionType: RewardDistributionType.Pool
            })
        });

        // Deploy the Promise contract
        promiseImpl = new Promise(promiseInfo, address(worldId), "app_staging_48e425187ceaa548d46adb5bdaa1c8b5");

        // Set up addresses
        host = address(this);
        rewardToken.transfer(address(promiseImpl), 100 ether);
        attendee = address(0x123);
    }

    function test_Check_In() public {
        // Simulate deposit        
        vm.deal(attendee, 1 ether);
        vm.startPrank(attendee);
        promiseImpl.depositToPromise{value: 1 ether}(0, 0, [uint256(0),0,0,0,0,0,0,0]);
        vm.stopPrank();

        // Simulate check-in by the host
        vm.startPrank(host);
        promiseImpl.checkIn(attendee, 0, 1, [uint256(0),0,0,0,0,0,0,0]);
        vm.stopPrank();
        bool r = promiseImpl.checkIns(attendee);
        // Validate check-in
        assertTrue(r);
    }

    function testClaimPromise() public {
        // Simulate deposit and check-in
        vm.deal(attendee, 1 ether);
        vm.startPrank(attendee);
        promiseImpl.depositToPromise{value: 1 ether}(0, 2, [uint256(0),0,0,0,0,0,0,0]);
        vm.stopPrank();

        vm.startPrank(host);
        promiseImpl.checkIn(attendee, 0, 8, [uint256(0),0,0,0,0,0,0,0]);        
        vm.stopPrank();
        // Move time forward to after the promiseImpl period
        vm.warp(block.timestamp + 2 days);

        // Claim the promiseImpl
        vm.startPrank(attendee);
        promiseImpl.claimPromise(0, 4, [uint256(0),0,0,0,0,0,0,0]);
        vm.stopPrank();

        // Validate claim status and token transfer
        assertTrue(promiseImpl.claimed(attendee));
        assertEq(rewardToken.balanceOf(attendee), 100 ether);
        assertEq(address(attendee).balance, 1 ether);
    }

    function testDepositToPromise() public {
        // Simulate deposit
        vm.deal(attendee, 1 ether);
        vm.startPrank(attendee);
        promiseImpl.depositToPromise{value: 1 ether}(0, 5, [uint256(0),0,0,0,0,0,0,0]);
        vm.stopPrank();

        // Validate deposit
        assertTrue(promiseImpl.deposits(attendee));
        assertEq(address(promiseImpl).balance, 1 ether);
    }

    function testCannotClaimBeforeCheckIn() public {
        // Attempt to claim without check-in should fail
        vm.expectRevert("User has not checked in");
        promiseImpl.claimPromise(0, 6, [uint256(0),0,0,0,0,0,0,0]);
    }

    function testCannotClaimBeforePeriodEnd() public {
        // Simulate deposit and check-in
        vm.deal(attendee, 1 ether);
        vm.startPrank(attendee);
        promiseImpl.depositToPromise{value: 1 ether}(0, 7, [uint256(0),0,0,0,0,0,0,0]);
        vm.stopPrank();

        vm.startPrank(host);
        promiseImpl.checkIn(attendee, 0, 8, [uint256(0),0,0,0,0,0,0,0]);        
        vm.stopPrank();

        // Attempt to claim before period end should fail
        vm.expectRevert("Promise period not ended");

        vm.startPrank(attendee);
        promiseImpl.claimPromise(0, 9, [uint256(0),0,0,0,0,0,0,0]);
        vm.stopPrank();
    }

    function testCannotReuseNullifier() public {
        // Simulate deposit and check-in
        vm.deal(attendee, 1 ether);
        vm.startPrank(attendee);
        promiseImpl.depositToPromise{value: 1 ether}(0, 0, [uint256(0),0,0,0,0,0,0,0]);
        vm.stopPrank();

        vm.startPrank(host);
        promiseImpl.checkIn(attendee, 0, 10, [uint256(0),0,0,0,0,0,0,0]);        
        vm.stopPrank();
        // Move time forward to after the promiseImpl period
        vm.warp(block.timestamp + 2 days);

        // Claim the promiseImpl
        vm.startPrank(attendee);
        // Attempt to claim again with the same nullifier should fail
        vm.expectRevert(Promise.InvalidNullifier.selector);
        promiseImpl.claimPromise(0, 10, [uint256(0),0,0,0,0,0,0,0]);
        vm.stopPrank();
    }
}
