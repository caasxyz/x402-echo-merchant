import {
    createPublicClient,
    createWalletClient,
    http,
    erc20Abi,
    getAddress,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia, base } from 'viem/chains';
import { Network } from 'x402-next';
import { PaymentRequirements } from 'x402/types';

// load the private key from the .env file
const privateKey = process.env.BASE_PRIVATE_KEY as `0x${string}`;
const account = privateKeyToAccount(privateKey);

/**
 * Get a signer for the network
 * @param network - The network to get a signer for
 * @returns The signer
 */
const getSigner = (network: Network) => {
    if (network === "base-sepolia") {
        return createWalletClient({
            chain: baseSepolia,
            transport: http(process.env.BASE_SEPOLIA_RPC_URL),
            account: account,
        });
    } else if (network === "base") {
        return createWalletClient({
            chain: base,
            transport: http(process.env.BASE_RPC_URL),
            account: privateKey,
        });
    } else {
        throw new Error("Unsupported network");
    }
}

/**
 * Get a public client for the network
 * @param network - The network to get a public client for
 * @returns The public client
 */
const getPublicClient = (network: Network) => {
    if (network === "base-sepolia") {
        return createPublicClient({
            chain: baseSepolia,
            transport: http(process.env.BASE_SEPOLIA_RPC_URL),
        });
    } else if (network === "base") {
        return createPublicClient({
            chain: base,
            transport: http(process.env.BASE_RPC_URL),
        });
    } else {
        throw new Error("Unsupported network");
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
    const publicClient = getPublicClient(selectedPaymentRequirements.network);

    // TODO determine if the asset is ETH or ERC20

    // call the ERC20 transfer function
    const toAddress = getAddress(recipient as `0x${string}`);
    const contractAddress = getAddress(selectedPaymentRequirements.asset as `0x${string}`);
    const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [
            toAddress,
            selectedPaymentRequirements.maxAmountRequired as unknown as bigint
        ],
        account: account,
    })
    const result = await signer.writeContract(request);

    return result;
};