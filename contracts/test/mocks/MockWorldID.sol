// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockWorldID {

    constructor(){

    }
    /// @notice Mock verifyProof function that always passes.
    /// @param root The Merkle root (this can be any value in the mock).
    /// @param signalHash The hash of the user's wallet address.
    /// @param nullifierHash The nullifier hash for this proof, preventing double signaling.
    /// @param externalNullifierHash The keccak256 hash of the externalNullifier.
    /// @param proof The zero-knowledge proof.
    function verifyProof(
        uint256 root,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external pure {
        // Since this is a mock, we're not performing any real verification.
        // In a real contract, you would add logic here to verify the proof.
        // This mock function simply does nothing to simulate a passing proof.
        uint a = root+1;
    }
}
