import {
    createWalletClient,
    http,
    erc20Abi,
    getAddress,
    publicActions,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalanche, avalancheFuji, base, baseSepolia, iotex, sei, seiTestnet } from 'viem/chains';
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
    if (network === "avalanche") {
        return createWalletClient({
          chain: avalanche,
          transport: http(process.env.AVALANCHE_RPC_URL as `https://${string}`),
          account,
        }).extend(publicActions);
    }
    else if (network === "avalanche-fuji") {
        return createWalletClient({
          chain: avalancheFuji,
          transport: http(process.env.AVALANCHE_FUJI_RPC_URL as `https://${string}`),
          account,
        }).extend(publicActions);
    }

    else if (network === "base-sepolia") {
        return createWalletClient({
          chain: baseSepolia,
          transport: http(process.env.BASE_SEPOLIA_RPC_URL as `https://${string}`),
          account,
        }).extend(publicActions);
    }

    else if (network === "base") {
        return createWalletClient({
          chain: base,
          transport: http(process.env.BASE_RPC_URL as `https://${string}`),
          account,
        }).extend(publicActions);
    }

    else if (network === "sei") {
        return createWalletClient({
          chain: sei,
          transport: http(process.env.SEI_RPC_URL as `https://${string}`),
          account,
        }).extend(publicActions);
    }

    else if (network === "sei-testnet") {
        return createWalletClient({
          chain: seiTestnet,
          transport: http(process.env.SEI_TESTNET_RPC_URL as `https://${string}`),
          account,
        }).extend(publicActions);
    }

    else if (network === "iotex") {
        return createWalletClient({
          chain: iotex,
          transport: http(process.env.IOTEX_RPC_URL as `https://${string}`),
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