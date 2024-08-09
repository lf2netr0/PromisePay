// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IWorldID.sol";
library ByteHasher {
	/// @dev Creates a keccak256 hash of a bytestring.
	/// @param value The bytestring to hash
	/// @return The hash of the specified value
	/// @dev `>> 8` makes sure that the result is included in our field
	function hashToField(bytes memory value) internal pure returns (uint256) {
		return uint256(keccak256(abi.encodePacked(value))) >> 8;
	}
}

enum PromiseType { Online, Offline }
enum RewardTokenType { BaseToken, ERC20 }
enum RewardDistributionType { Pool, EachPerson }

contract Promise {
    using ByteHasher for bytes;


    struct Reward {
        address tokenAddress;
        RewardTokenType tokenType;
        uint256 amount;
        RewardDistributionType distributionType;
    }

    struct PromiseInfo {
        address host;
        string title;
        uint256 period;
        PromiseType promiseType;
        string location;
        uint256 depositRequiredAmount;
        bool depositRequired;
        bool rewardIncluded;
        Reward reward;
    }

    mapping(address => bool) public checkIns;
    mapping(address => bool) public deposits;
    mapping(uint256 => bool) internal nullifierHashes;
    PromiseInfo public promiseInfo;

    IWorldID internal immutable worldId;
    uint256 internal immutable checkInExternalNullifierHash;
    uint256 internal immutable claimExternalNullifierHash;
    uint256 internal immutable depositExternalNullifierHash;
    uint256 internal immutable groupId = 1;

    event CheckIn(address indexed attendee);
    event ClaimPromise(address indexed claimant);
    event DepositToPromise(address indexed depositor);

    error InvalidNullifier();

    constructor(
        address _host,
        string memory _title,
        uint256 _period,
        PromiseType _promiseType,
        string memory _location,
        uint256 _depositRequiredAmount,
        bool _depositRequired,
        bool _rewardIncluded,
        address _rewardTokenAddress,
        RewardTokenType _rewardTokenType,
        uint256 _rewardAmount,
        RewardDistributionType _rewardDistributionType,
        IWorldID _worldId,
        string memory _appId
    ) {
        promiseInfo = PromiseInfo({
            host: _host,
            title: _title,
            period: _period,
            promiseType: _promiseType,
            location: _location,
            depositRequiredAmount: _depositRequiredAmount,
            depositRequired: _depositRequired,
            rewardIncluded: _rewardIncluded,
            reward: Reward({
                tokenAddress: _rewardTokenAddress,
                tokenType: _rewardTokenType,
                amount: _rewardAmount,
                distributionType: _rewardDistributionType
            })
        });
        
        worldId = _worldId;
        checkInExternalNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), 'check_in')
            .hashToField();
        claimExternalNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), 'claim')
            .hashToField();
        depositExternalNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), 'deposit')
            .hashToField();
    }

    function checkIn(
        address _attendee,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        require(msg.sender == promiseInfo.host, "Only host can check in attendees");
        verifyAndExecute(_attendee, root, nullifierHash, proof, checkInExternalNullifierHash);
        checkIns[_attendee] = true;
        emit CheckIn(_attendee);
        // Emit EAS attest here
    }

    function claimPromise(
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        require(checkIns[msg.sender], "User has not checked in");
        require(block.timestamp > promiseInfo.period, "Promise period not ended");
        verifyAndExecute(msg.sender, root, nullifierHash, proof, claimExternalNullifierHash);
        if (promiseInfo.depositRequired) {
            // Refund deposit if applicable
        }
        if (promiseInfo.rewardIncluded) {
            // Distribute rewards here
        }
        emit ClaimPromise(msg.sender);
        // Emit EAS attest here
    }

    function depositToPromise(
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external payable {
        require(promiseInfo.depositRequired, "Deposit not required for this promise");
        require(msg.value == promiseInfo.depositRequiredAmount, "Incorrect deposit amount");
        verifyAndExecute(msg.sender, root, nullifierHash, proof, depositExternalNullifierHash);
        deposits[msg.sender] = true;
        emit DepositToPromise(msg.sender);
        // Emit EAS attest here
    }

    function verifyAndExecute(
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof,
        uint256 externalNullifierHash
    ) internal {
        // First, we make sure this person hasn't done this before
        if (nullifierHashes[nullifierHash]) revert InvalidNullifier();

        // We now verify the provided proof is valid and the user is verified by World ID
        worldId.verifyProof(
            root,
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            externalNullifierHash,
            proof
        );

        // We now record the user has done this, so they can't do it again (sybil-resistance)
        nullifierHashes[nullifierHash] = true;

    }
}
