import {
    createWalletClient,
    http,
    erc20Abi,
    getAddress,
    publicActions,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalanche, iotex } from 'viem/chains';
import { Network } from 'x402-next';
import { PaymentRequirements, evm } from 'x402/types';

// load the private key from the .env file
const privateKey = process.env.BASE_PRIVATE_KEY as `0x${string}`;
const account = privateKeyToAccount(privateKey);

const { createSigner } = evm;

/**
 * Get a signer for the network
 * @param network - The network to get a signer for
 * @returns The signer
 */
const getSigner = (network: Network) => {
    // TODO replace this once PR gets merged to support avalanche
    if (network === "avalanche") {
        return createWalletClient({
          chain: avalanche,
          transport: http(),
          account,
        }).extend(publicActions);    }

    // TODO replace these once PR gets merged to support iotex
    else if (network === "iotex") {
        return createWalletClient({
          chain: iotex,
          transport: http(),
          account,
        }).extend(publicActions);
    }

    else {
        return createSigner(network, privateKey);
    }
}

/**
 * Refund the payment
 * @param selectedPaymentRequirements - The selected payment requirements
 * @returns The tx hash of the refund
 */
export const refund = async (
    recipient: string,
    selectedPaymentRequirements: PaymentRequirements
) => {
    // create a signer for the network
    const signer = getSigner(selectedPaymentRequirements.network);

    // TODO determine if the asset is ETH or ERC20

    // call the ERC20 transfer function
    const toAddress = getAddress(recipient as `0x${string}`);
    const contractAddress = getAddress(selectedPaymentRequirements.asset as `0x${string}`);
    const result = await signer.writeContract({
        address: contractAddress,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [
            toAddress,
            selectedPaymentRequirements.maxAmountRequired as unknown as bigint
        ],
        account: account,
    });

    return result;
};