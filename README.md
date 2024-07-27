# `rikyRaidConfig.json` Configuration File

The `rikyRaidConfig.json` file contains the essential configuration settings for the Riky Raid application. This JSON file defines key addresses, network details, and API credentials required for the operation of the application.

## Configuration Fields

### `rikyAddress`
- **Description**: The address of the RIKY token contract.
- **Example**: `"0x729031B3995538DDF6B6cE66B8D5D6FDEb3CCB5"`

### `raidMaster`
- **Description**: The address of the Raid Master contract, responsible for managing raids.
- **Example**: `"0x750422b4D10370B80Cd8dF80cA55abb640fb77b5"`

### `network`
- **Description**: Refer to context.js. **Available:** "*base*", "*baseSepolia*"
- **Example**: `"base"`

### `publicRpc`
- **Description**: RPC URL used to interact with the blockchain. [GET ONE HERE](https://portal.cdp.coinbase.com/products/node)
- **Example**: `"https://api.developer.coinbase.com/rpc/v1/base/YOURNODEKEY"`

### `blockExplorer`
- **Description**: The URL of the block explorer for viewing transaction and contract details.
- **Example**: `"https://basescan.org/"`

### `twitterBearerToken`
- **Description**: The Bearer Token for accessing the Twitter API (not required in this configuration).
- **Example**: `"AAAAAAAAAAAAAAAOQRvAEAAAAAQ2kkVTLMIph%2F9C9FlITc8Xmhjis%3DUB6jBD6fAstn1gcIM5p5"`

### `oraclePrivateKey`
- **Description**: The private key for the oracle, used for signing transactions (not required in this configuration).
- **Example**: `"afdfd9c3d2095ef696594f6cedcae59e72dcd697e2a7521b1578140422a4f890"`

## Usage

The application will read the configuration values from this file to connect to the blockchain, interact with smart contracts, and optionally integrate with the Twitter API if required.

Ensure the addresses and URLs are correctly set before deploying or running your application. Replace any placeholder values with actual credentials and addresses pertinent to your deployment.

