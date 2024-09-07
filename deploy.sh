#!/bin/bash

networks=(
  "celo_alfajores"
  "mantle_sepolia"
  "zircuit_testnet"
)

# Loop through each network and run the deploy command
for network in "${networks[@]}"
do
  echo "Deploying to $network..."
  hh deploy --verify --network "$network"
  echo "----------------------------------------"
done

echo "All deployments completed."
