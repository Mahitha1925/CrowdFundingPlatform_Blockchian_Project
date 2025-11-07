import React, { useContext, createContext } from 'react';
import { parseEther } from 'viem';
import { client } from '../client';
import { defineChain, getContract } from 'thirdweb';
import {
  useSendAndConfirmTransaction,
  useActiveAccount,
} from 'thirdweb/react';
import { prepareContractCall, readContract } from 'thirdweb'
import { useReadContract } from 'thirdweb/react'

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const contract = getContract({
    client,
    chain: defineChain(11155111), // Sepolia testnet
    address: '0xD6A2727a050f7764a528a0841fe8E6c631c93a7C',
  });

  const { mutateAsync: sendTx } = useSendAndConfirmTransaction();
  const account = useActiveAccount();

  const publishCampaign = async (form) => {
    try {
      const transaction = await prepareContractCall({
        contract,
        method:
          'function createCampaign(address _owner, string _title, string _description, uint256 _target, uint256 _deadline, string _image) returns (uint256)',
        params: [
          account?.address,
          form.title,
          form.description,
          parseEther(form.target),
          Math.floor(new Date(form.deadline).getTime() / 1000),
          form.image,
        ],
      });

      const { transactionHash } = await sendTx({
        transaction,
        account,
      });

      console.log('Contract call success:', transactionHash);
    } catch (error) {
      console.log('Contract call failure:', error);
    }
  };

  const getCampaigns = async () => {
    const { campaigns, isPending } = useReadContract({
      contract,
      method:
        "function getCampaigns() view returns ((address owner, string title, string description, uint256 target, uint256 deadline, uint256 amountCollected, string image, address[] donators, uint256[] donations)[])",
      params: [],
    });

    const parsedCampaigns = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: parseEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: parseEther(campaign.amountCollected.toString()),
      image: campaign.image,
      pId: i,
    }));

    return parsedCampaigns;
  };

  const getUserCampaigns = async () => {
    const allCampaigns = await readContract({
      contract,
      method:
        'function getCampaigns() view returns ((address owner, string title, string description, uint256 target, uint256 deadline, uint256 amountCollected, string image, address[] donators, uint256[] donations)[])',
      params: [],
    });

    const filteredCampaigns = allCampaigns
      .map((campaign, i) => ({
        ...campaign,
        pId: i,
      }))
      .filter((campaign) => campaign.owner === account?.address);

    return filteredCampaigns;
  };

  const donate = async (pId, amount) => {
    try {
      const transaction = await prepareContractCall({
        contract,
        method: 'function donateToCampaign(uint256 _id) payable',
        params: [pId],
        value: parseEther(amount),
      });

      const { transactionHash } = await sendTx({
        transaction,
        account,
      });

      console.log('Donation successful:', transactionHash);
    } catch (error) {
      console.log('Donation failed:', error);
    }
  };

  const getDonations = async (pId) => {
    const donations = await readContract({
      contract,
      method: 'function getDonators(uint256 _id) view returns (address[], uint256[])',
      params: [pId],
    });

    const numberOfDonations = donations[0].length;
    const parsedDonations = [];

    for (let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: parseEther(donations[1][i].toString()),
      });
    }

    return parsedDonations;
  };

  return (
    <StateContext.Provider
      value={{
        address: account?.address || '',
        contract,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
