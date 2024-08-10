// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./interfaces/IWorldID.sol";
import './interfaces/IERC20.sol';
library ByteHasher {
    /// @dev Creates a keccak256 hash of a bytestring.
    /// @param value The bytestring to hash
    /// @return The hash of the specified value
    /// @dev `>> 8` makes sure that the result is included in our field
    function hashToField(bytes memory value) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(value))) >> 8;
    }
}

enum PromiseType {
    Online,
    Offline
}
enum RewardTokenType {
    BaseToken,
    ERC20
}
enum RewardDistributionType {
    Pool
}

struct Reward {
    address tokenAddress;
    RewardTokenType tokenType;
    uint256 amount;
    RewardDistributionType distributionType;
}

struct PromiseInfo {
    address host;
    string title;
    uint256 periodST;
    uint256 periodEnd;
    PromiseType promiseType;
    string location;
    uint256 depositRequiredAmount;
    bool depositRequired;
    bool depositReturn;
    bool rewardIncluded;
    Reward reward;
}

contract Promise {
    using ByteHasher for bytes;

    mapping(address => bool) public checkIns;
    mapping(address => bool) public deposits;
    mapping(address => bool) public claimed;
    mapping(uint256 => bool) internal nullifierHashes;
    PromiseInfo public promiseInfo;

    IWorldID internal immutable worldId;
    uint256 internal immutable checkInExternalNullifierHash;
    uint256 internal immutable claimExternalNullifierHash;
    uint256 internal immutable depositExternalNullifierHash;
    uint256 internal immutable groupId = 1;
    uint256 attendeeCount;

    event CheckIn(address indexed attendee);
    event ClaimPromise(address indexed claimAddr, uint256 etherVal, address tokenAddr, uint256 tokenAmount );
    event DepositToPromise(address indexed depositor);

    error InvalidNullifier();

    constructor(
        PromiseInfo memory _promiseInfo,
        address _worldId,
        string memory _appId
    ) {
        promiseInfo = _promiseInfo;

        worldId = IWorldID(_worldId);
        checkInExternalNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), "check-in")
            .hashToField();
        claimExternalNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), "claim")
            .hashToField();
        depositExternalNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), "deposit")
            .hashToField();
    }

    function checkIn(
        address _attendee,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        require(
            msg.sender == promiseInfo.host,
            "Only host can check in attendees"
        );
        require(deposits[_attendee], "Invalid Attendee");
        verifyAndExecute(
            _attendee,
            root,
            nullifierHash,
            proof,
            checkInExternalNullifierHash
        );
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
        require(claimed[msg.sender] == false, "Already Claim");
        require(
            block.timestamp > promiseInfo.periodEnd,
            "Promise period not ended"
        );
        verifyAndExecute(
            msg.sender,
            root,
            nullifierHash,
            proof,
            claimExternalNullifierHash
        );
        uint256 valueSent;
        uint256 tokenSent;
        if (promiseInfo.depositRequired && promiseInfo.depositReturn) {
            // Refund deposit if applicable
            valueSent += promiseInfo.depositRequiredAmount;
        }
        if (promiseInfo.rewardIncluded) {
            // Distribute rewards here
            if (promiseInfo.reward.tokenType == RewardTokenType.ERC20) {
                // Distribute rewards here
                if (promiseInfo.rewardIncluded) {
                    if (promiseInfo.reward.tokenType == RewardTokenType.ERC20) {
                        require(
                            attendeeCount > 0,
                            "No eligible users for reward"
                        );

                        // Calculate the amount each user should get
                        uint256 amountPerUser = promiseInfo.reward.amount /
                            attendeeCount;
                        // uint256 remainder = promiseInfo.reward.amount %
                        //     attendeeCount;

                        // Transfer the tokens to the user
                        tokenSent = amountPerUser;
                    } else {
                        // Handle Base Token rewards
                        valueSent += promiseInfo.reward.amount;
                    }
                }
            } else {
                valueSent += promiseInfo.depositRequiredAmount;
            }
        }
        claimed[msg.sender] = true;
        if (valueSent > 0) {
            (bool isSent, bytes memory d) = msg.sender.call{value: valueSent}(
                ""
            );
            require(isSent, "Claim failed");
        }
        if (tokenSent > 0) {
            IERC20(promiseInfo.reward.tokenAddress).transfer(
                msg.sender,
                tokenSent
            );
        }
        emit ClaimPromise(msg.sender, valueSent, promiseInfo.reward.tokenAddress, tokenSent);
        // Emit EAS attest here
    }

    function depositToPromise(
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external payable {
        require(
            promiseInfo.depositRequired,
            "Deposit not required for this promise"
        );
        require(
            msg.value == promiseInfo.depositRequiredAmount,
            "Incorrect deposit amount"
        );
        verifyAndExecute(
            msg.sender,
            root,
            nullifierHash,
            proof,
            depositExternalNullifierHash
        );
        deposits[msg.sender] = true;
        attendeeCount++;
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
