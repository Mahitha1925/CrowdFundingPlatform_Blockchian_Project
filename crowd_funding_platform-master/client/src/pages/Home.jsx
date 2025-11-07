import React, { useState, useEffect } from 'react';
import { DisplayCampaigns } from '../components';
import { useStateContext } from '../context';
import { useReadContract } from 'thirdweb/react';
import { ethers } from 'ethers';

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const { contract } = useStateContext();  // Get contract from context

  // Using useReadContract hook to fetch campaigns
  const { data, isPending, error } = useReadContract({
    contract,
    method:
      "function getCampaigns() view returns ((address owner, string title, string description, uint256 target, uint256 deadline, uint256 amountCollected, string image, address[] donators, uint256[] donations)[])",
    params: [],
  });


  // Error handling
  useEffect(() => {
    if (error) {
      console.error("Error fetching campaigns:", error);
    }
  }, [error]);

  // Parse the fetched campaigns data
  useEffect(() => {
    if (isPending || !data) return;

    const parsedCampaigns = data.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()), // Convert from Wei to Ether
      deadline: new Date(campaign.deadline.toNumber() * 1000).toLocaleString(), // Convert timestamp to readable format
      amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()), // Convert from Wei to Ether
      image: campaign.image,
      pId: i,
    }));
    setCampaigns(parsedCampaigns);
  }, [data, isPending]); // Run on data or isPending change

  return (
    <DisplayCampaigns
      title="All Campaigns"
      isLoading={isPending}
      campaigns={campaigns}
    />
  );
};

export default Home;
