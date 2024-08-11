import { useRouter } from 'next/router';
import { Badge, Box, Button, FormLabel, Input, Text, VStack, useToast } from '@chakra-ui/react';
import RPC from "../../components/evm.web3";

import { IDKitWidget, ISuccessResult } from '@worldcoin/idkit'
import { useAtom } from 'jotai';
import { addressAtom, providerAtom } from '../../components/state';
import { useEffect, useState } from 'react';
import { IPromiseData } from '../../components/IPromise';
import QRCode from 'react-qr-code';


export default function ServerSidePage() {
    const router = useRouter();
    const { promiseAddress } = router.query;
    const [provider] = useAtom(providerAtom)
    const [promiseInfo, setPromiseInfo] = useState({} as IPromiseData);
    const [account] = useAtom(addressAtom)
    // Convert and format data
    const now = Math.floor(Date.now() / 1000);
    // States to track user interactions
    const [userHasDeposited, setUserHasDeposited] = useState(false);
    const [userHasCheckedIn, setUserHasCheckedIn] = useState(false);
    const [userHasClaimed, setUserHasClaimed] = useState(false);
    const [checkInInfo, setCheckInInfo] = useState('');
    const [checkInInfoInput, setCheckInInfoInput] = useState('');
    const toast = useToast();
    let rpc = new RPC(provider);

    useEffect(() => {
        const fetchData = async () => {
            if (provider && promiseAddress && account) {

                rpc = new RPC(provider);
                const info = await rpc.getPromiseInfo(promiseAddress as string);
                setPromiseInfo(info)
                // Assume these functions are available in your contract API
                const { checkedIn, claimed, deposited } = await rpc.getUserPromiseStatus(promiseAddress as string, account);

                setUserHasDeposited(deposited);
                setUserHasCheckedIn(checkedIn);
                setUserHasClaimed(claimed);
            }
        }
        fetchData()
    }, [provider, promiseAddress, account]);

    const promiseTypes = ['Online', 'Offline']; // Assuming 0: Online, 1: Offline
    const rewardTypes = ['Base Token', 'ERC20']; // Assuming 0: Base Token, 1: ERC20
    // Button click handlers
    const handleDeposit = async (proof: ISuccessResult) => {
        try {
            if (provider && promiseAddress && account) {
                rpc = new RPC(provider);
                const receipt = await rpc.depositPromise(promiseAddress, proof.merkle_root, proof.nullifier_hash, proof.proof.replace('0x', '').match(/.{1,64}/g).map(a => '0x' + a), promiseInfo.depositRequiredAmount)
                toast({
                    title: "Deposit sent.",
                    description: "Your promise has been successfully deposit! Tx: " + receipt.transactionHash,
                    status: "success",
                    duration: 10000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.log(error.message)
            toast({
                title: "Error deposit to promise.",
                description: error.message,
                status: "error",
                duration: 10000,
                isClosable: true,
            });
        }
        console.log(proof)
    };

    const handleCheckInInfo = async (proof: ISuccessResult) => {
        if (account) {
            Object.assign(proof, { user: account })
            setCheckInInfo(JSON.stringify(proof))
        }
    };

    const handleCheckIn = async () => {
        if (checkInInfoInput) {
            const proof = JSON.parse(checkInInfoInput)
            try {
                if (provider && promiseAddress && account) {
                    rpc = new RPC(provider);
                    const receipt = await rpc.checkInPromise(promiseAddress, proof.user, proof.merkle_root, proof.nullifier_hash, proof.proof.replace('0x', '').match(/.{1,64}/g).map(a => '0x' + a))
                    toast({
                        title: "Deposit sent.",
                        description: "Your promise has been successfully deposit! Tx: " + receipt.transactionHash,
                        status: "success",
                        duration: 10000,
                        isClosable: true,
                    });
                }
            } catch (error) {
                console.log(error.message)
                toast({
                    title: "Error deposit to promise.",
                    description: error.message,
                    status: "error",
                    duration: 10000,
                    isClosable: true,
                });
            }
            console.log(proof)
        }
    };

    const handleClaim = async (proof: ISuccessResult) => {
        try {
            if (provider && promiseAddress && account) {
                rpc = new RPC(provider);
                const receipt = await rpc.claimPromise(promiseAddress, proof.merkle_root, proof.nullifier_hash, proof.proof.replace('0x', '').match(/.{1,64}/g).map(a => '0x' + a))
                toast({
                    title: "Deposit sent.",
                    description: "Your promise has been successfully deposit! Tx: " + receipt.transactionHash,
                    status: "success",
                    duration: 10000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.log(error.message)
            toast({
                title: "Error deposit to promise.",
                description: error.message,
                status: "error",
                duration: 10000,
                isClosable: true,
            });
        }
        console.log(proof)
    };
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(checkInInfo);
            alert('Copied to clipboard!');  // 实际使用中可能会使用更优雅的通知方式
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };
    const onSuccess = () => {
        // This is where you should perform any actions after the modal is closed
        // Such as redirecting the user to a new page
        console.log("/success");
    };

    if (promiseInfo.host) {
        return (

            <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
                <VStack align="start" spacing={4}>
                    <Text fontSize="2xl" fontWeight="bold">{promiseInfo.title}</Text>
                    <Text>Host: <Badge ml="1" colorScheme="purple">{promiseInfo.host}</Badge></Text>
                    <Text>Location: <Badge ml="1" colorScheme="green">{promiseInfo.location}</Badge></Text>
                    <Text>Promise Type: {promiseTypes[promiseInfo.promiseType]}</Text>
                    <Text>Period Start: {new Date(Number(promiseInfo.periodST) * 1000).toLocaleString()}</Text>
                    <Text>Period End: {new Date(Number(promiseInfo.periodEnd) * 1000).toLocaleString()}</Text>
                    <Text>Deposit Required: {promiseInfo.depositRequired ? 'Yes' : 'No'}</Text>
                    {promiseInfo.depositRequired && (
                        <>
                            <Text>Deposit Amount: {rpc.web3.utils.fromWei(promiseInfo.depositRequiredAmount, 'ether') + ' ETH'}</Text>
                            <Text>Deposit Return: {promiseInfo.depositReturn ? 'Yes' : 'No'}</Text>
                        </>
                    )}
                    <Text>Reward Included: {promiseInfo.rewardIncluded ? 'Yes' : 'No'}</Text>
                    {promiseInfo.rewardIncluded && (
                        <>
                            <Text>Reward Token Address: {promiseInfo.reward.tokenAddress}</Text>
                            <Text>Reward Type: {rewardTypes[promiseInfo.reward.tokenType]}</Text>
                            <Text>Reward Amount: {promiseInfo.reward.amount}</Text>
                        </>
                    )}
                    {now < promiseInfo.periodEnd && !userHasDeposited && account !== promiseInfo.host && (
                        // 
                        <IDKitWidget
                            // 
                            app_id="app_staging_48e425187ceaa548d46adb5bdaa1c8b5" // must be an app set to on-chain in Developer Portal
                            action="deposit"
                            signal={account} // proof will only verify if the signal is unchanged, this prevents tampering
                            handleVerify={handleDeposit} // callback when the proof is received
                            onSuccess={onSuccess} // use onSuccess to call your smart contract
                        // no use for handleVerify, so it is removed
                        // use default verification_level (orb-only), as device credentials are not supported on-chain
                        >
                            {({ open }) => <Button isDisabled={userHasDeposited || userHasClaimed} colorScheme="blue" onClick={open} >Deposit with WorldID</Button>}
                        </IDKitWidget>
                    )}
                    {!checkInInfo && now < promiseInfo.periodEnd && userHasDeposited && account !== promiseInfo.host && (
                        // 
                        <IDKitWidget
                            // 
                            app_id="app_staging_48e425187ceaa548d46adb5bdaa1c8b5" // must be an app set to on-chain in Developer Portal
                            action="check-in"
                            signal={account} // proof will only verify if the signal is unchanged, this prevents tampering
                            handleVerify={handleCheckInInfo} // callback when the proof is received
                            onSuccess={onSuccess} // use onSuccess to call your smart contract
                        // no use for handleVerify, so it is removed
                        // use default verification_level (orb-only), as device credentials are not supported on-chain
                        >
                            {({ open }) => <Button isDisabled={!userHasDeposited || userHasCheckedIn} colorScheme="blue" onClick={open} >Show Check-in info with WorldID</Button>}
                        </IDKitWidget>
                    )}
                    {checkInInfo && (
                        <>
                            <QRCode
                                size={256}
                                style={{ height: "auto", maxWidth: "30%", width: "30%" }}
                                value={checkInInfo}
                                viewBox={`0 0 256 256`}
                            />

                            <Button colorScheme="teal" onClick={handleCopy}>Copy QRcode</Button>
                        </>
                    )}
                    {now < promiseInfo.periodEnd && account === promiseInfo.host && (

                        <>
                            <Input id='checkInInfoInput' value={checkInInfoInput} onChange={e => setCheckInInfoInput(e.target.value)} placeholder='Paste QRcode' />
                            <Button colorScheme="green" onClick={handleCheckIn} isDisabled={userHasCheckedIn}>Check-In</Button>
                        </>
                    )}
                    {userHasDeposited && (
                        <IDKitWidget
                            // 
                            app_id="app_staging_48e425187ceaa548d46adb5bdaa1c8b5" // must be an app set to on-chain in Developer Portal
                            action="claim"
                            signal={account} // proof will only verify if the signal is unchanged, this prevents tampering
                            handleVerify={handleClaim} // callback when the proof is received
                            onSuccess={onSuccess} // use onSuccess to call your smart contract
                        >
                            {({ open }) =>
                                <Button colorScheme="teal" onClick={open} isDisabled={now < promiseInfo.periodEnd || userHasClaimed}>Claim with WorldID</Button>}
                        </IDKitWidget>
                    )}
                </VStack>
            </Box>
        );
    }
}
