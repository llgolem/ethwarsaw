#!/bin/bash

networks=(
  "optimism_sepolia"
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

# Deploying to optimism_sepolia...
# Deploying CreditManager to optimism_sepolia...
# 📰 Contract CreditManager deployed to optimism_sepolia at address: 0x5b82122cf33ab680c779a2b5d606776e607fa5e5
# Successfully verified contract CreditManager on Sourcify.
# https://repo.sourcify.dev/contracts/full_match/11155420/0x5b82122cf33ab680c779a2b5d606776e607fa5e5/
# ✅ Contract 0x5b82122cf33ab680c779a2b5d606776e607fa5e5 has been verified successfully
# ----------------------------------------
# Deploying to celo_alfajores...
# Deploying CreditManager to celo_alfajores...
# 📰 Contract CreditManager deployed to celo_alfajores at address: 0x5b82122cf33ab680c779a2b5d606776e607fa5e5
# Successfully verified contract CreditManager on Sourcify.
# https://repo.sourcify.dev/contracts/full_match/44787/0x5b82122cf33ab680c779a2b5d606776e607fa5e5/
# ✅ Contract 0x5b82122cf33ab680c779a2b5d606776e607fa5e5 has been verified successfully
# ----------------------------------------
# Deploying to mantle_sepolia...
# Deploying CreditManager to mantle_sepolia...
# 📰 Contract CreditManager deployed to mantle_sepolia at address: 0x37a28446d9952ac66d9f42f44fac47e704b6c95f
# Successfully verified contract CreditManager on Sourcify.
# https://repo.sourcify.dev/contracts/full_match/5003/0x37a28446d9952ac66d9f42f44fac47e704b6c95f/
# ✅ Contract 0x37a28446d9952ac66d9f42f44fac47e704b6c95f has been verified successfully
# ----------------------------------------
# Deploying to zircuit_testnet...
# Deploying CreditManager to zircuit_testnet...
# 📰 Contract CreditManager deployed to zircuit_testnet at address: 0x37a28446d9952ac66d9f42f44fac47e704b6c95f
# 🔄️ Verification failed, trying again in 10 seconds...