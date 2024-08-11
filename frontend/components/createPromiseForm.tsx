import React, { useState } from 'react';
import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    Stack,
    Box,
    NumberInput,
    NumberInputField,
    Switch,
    FormHelperText,
    useToast
} from '@chakra-ui/react';

import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import RPC from "./evm.web3";
import { useAtom } from 'jotai';
import { addressAtom, providerAtom } from './state';
import { PromiseType, RewardDistributionType, RewardTokenType } from './IPromise';
const CreatePromiseForm = () => {
    const [provider] = useAtom(providerAtom)
    const rpc = new RPC(provider);
    const [title, setTitle] = useState('');
    const [periodST, setPeriodST] = useState(new Date);
    const [periodEnd, setPeriodEnd] = useState(new Date);
    const [promiseType, setType] = useState(0);
    const [location, setLocation] = useState('');
    const [depositRequired, setDepositRequired] = useState(false);
    const [depositRequiredAmount, setDepositAmount] = useState('0');
    const [depositReturn, setDepositReturn] = useState(false);
    const [rewardIncluded, setRewardIncluded] = useState(false);
    const [rewardAmount, setRewardAmount] = useState('0');
    const [rewardToken, setRewardToken] = useState('0x0000000000000000000000000000000000000000');
    const [distributionType, setDistributionType] = useState(0);
    const [tokenType, setTokenType] = useState(0);
    const [account] = useAtom(addressAtom)
    const toast = useToast();
    console.log(account)
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(rpc.web3.utils.toWei(depositRequiredAmount, 'ether'))
        try {
            // 假设 createPromise 是传递到此组件的函数，用于与区块链交互
            const receipt = await rpc.createPromise({
                host: account,
                title,
                periodST: Math.round(Number(periodST) / 1000),
                periodEnd: Math.round(Number(periodEnd) / 1000),
                promiseType,
                location,
                depositRequired,
                depositRequiredAmount: rpc.web3.utils.toWei(depositRequiredAmount, 'ether'),
                depositReturn,
                rewardIncluded,
                reward: {
                    amount: rpc.web3.utils.toWei(rewardAmount, 'ether'),
                    tokenAddress: rewardToken,
                    distributionType,
                    tokenType
                }
            });
            toast({
                title: "Promise created.",
                description: "Your promise has been successfully created! Tx: " + receipt.transactionHash,
                status: "success",
                duration: 10000,
                isClosable: true,
            });
        } catch (error) {
            console.log(error.message)
            toast({
                title: "Error creating promise.",
                description: error.message,
                status: "error",
                duration: 10000,
                isClosable: true,
            });
        }
    };

    return (
        <Box p={5} shadow='md' borderWidth='1px' borderRadius='md'>
            <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                    <FormControl isRequired>
                        <FormLabel htmlFor='title'>Title</FormLabel>
                        <Input id='title' value={title} onChange={e => setTitle(e.target.value)} placeholder='Enter title' />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel htmlFor='periodST'>Start Period</FormLabel>
                        <ReactDatePicker
                            selected={periodST}
                            onChange={date => setPeriodST(date)}
                            showTimeSelect
                            dateFormat="Pp"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel htmlFor='periodEnd'>End Period</FormLabel>
                        <ReactDatePicker
                            selected={periodEnd}
                            onChange={date => setPeriodEnd(date)}
                            showTimeSelect
                            dateFormat="Pp"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel htmlFor='promiseType'>Type</FormLabel>
                        <Select id='promiseType' value={promiseType} onChange={e => setType(e.target.value as PromiseType)}>
                            {Object.values(PromiseType).map((p, k) => (
                                <option key={k} value={k}>
                                    {p}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel htmlFor='location'>Location</FormLabel>
                        <Input id='location' value={location} onChange={e => setLocation(e.target.value)} placeholder='Enter location' />
                    </FormControl>

                    <FormControl display='flex' alignItems='center'>
                        <FormLabel htmlFor='deposit-required' mb='0'>
                            Deposit Required?
                        </FormLabel>
                        <Switch id='deposit-required' isChecked={depositRequired} onChange={e => setDepositRequired(e.target.checked)} />
                    </FormControl>

                    {depositRequired && (
                        <>
                            <FormControl isRequired>
                                <FormLabel htmlFor='deposit-amount'>Deposit Amount</FormLabel>
                                <NumberInput min={0}>
                                    <NumberInputField id='deposit-amount' value={depositRequiredAmount} onChange={e => setDepositAmount(parseFloat(e.target.value).toString())} />
                                </NumberInput>
                            </FormControl>

                            <FormControl display='flex' alignItems='center'>
                                <FormLabel htmlFor='deposit-return' mb='0'>
                                    Return Deposit?
                                </FormLabel>
                                <Switch id='deposit-return' isChecked={depositReturn} onChange={e => setDepositReturn(e.target.checked)} />
                            </FormControl>
                        </>
                    )}

                    <FormControl display='flex' alignItems='center'>
                        <FormLabel htmlFor='reward-included' mb='0'>
                            Include Reward?
                        </FormLabel>
                        <Switch id='reward-included' isChecked={rewardIncluded} onChange={e => setRewardIncluded(e.target.checked)} />
                    </FormControl>

                    {rewardIncluded && (
                        <>
                            <FormControl isRequired>
                                <FormLabel htmlFor='reward-amount'>Reward Amount</FormLabel>
                                <NumberInput min={0}>
                                    <NumberInputField id='reward-amount' value={rewardAmount} onChange={e => setRewardAmount(parseFloat(e.target.value).toString())} />
                                </NumberInput>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel htmlFor='reward-token'>Reward Token Address</FormLabel>
                                <Input id='reward-token' value={rewardToken} onChange={e => setRewardToken(e.target.value)} placeholder='Enter reward token address' />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel htmlFor='tokenType'>TokenType</FormLabel>
                                <Select id='tokenType' value={tokenType} onChange={e => setTokenType(e.target.value as RewardTokenType)}>
                                    {Object.values(RewardTokenType).map((p, k) => (
                                        <option key={k} value={k}>
                                            {p}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel htmlFor='distributionType'>DistributionType</FormLabel>
                                <Select id='distributionType' value={distributionType} onChange={e => setDistributionType(e.target.value as RewardDistributionType)}>
                                    {Object.values(RewardDistributionType).map((p, k) => (
                                        <option key={k} value={k}>
                                            {p}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        </>
                    )}

                    <Button mt={4} colorScheme='teal' type='submit'>Create Promise</Button>
                </Stack>
            </form>
        </Box>
    );
};


export default CreatePromiseForm;
