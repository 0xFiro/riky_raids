import { verifyMessage, JsonRpcProvider, Contract } from 'ethers';
import { TwitterApi } from 'twitter-api-v2';
import ABI from "@/functions/ABI.json"
import config from "@/rikyRaidConfig.json"

const twitterClient = new TwitterApi(config.twitterBearerToken);
const readOnlyClient = twitterClient.readOnly;

const getBaseUrl = (req) => {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  return `${protocol}://${host}`;
};

const getWinningTicket = async (raidAddress, req) => {
  try {
    const baseUrl = getBaseUrl(req);
    const provider = new JsonRpcProvider(`${baseUrl}/api/rpc`);
    const raidContract = new Contract(raidAddress, ABI.raid, provider);
    const winningTicket = await raidContract.winningTicket();
    const winningTicketInfo = await raidContract.tickets(winningTicket);
    return winningTicketInfo;
  } catch (e) {
    console.log('Error in getWinningTicket:', e);
  }
};

const getTwitters = async (raidAddy, req) => {
  try {
    const baseUrl = getBaseUrl(req);
    const provider = new JsonRpcProvider(`${baseUrl}/api/rpc`);
    const raidContract = new Contract(raidAddy, ABI.raid, provider);
    const socials1 = await raidContract.twitters(0);
    const socials2 = await raidContract.twitters(1);
    const regex = /https?:\/\/x\.com\/([^\/\?\#]+)/;
    const match1 = socials1.match(regex);
    const match2 = socials2.match(regex);

    return [match1[1], match2[1]];
  } catch (e) {
    console.log('Error in getTwitters:', e);
  }
};

const verifySignature = async (message, signature, address) => {
  try {
    const signerAddress = verifyMessage(message, signature);
    return signerAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.log('Error in verifySignature:', error);
    return false;
  }
};

const handler = async (req, res) => {
    console.log(process.env.TWITTER_BEARER_TOKEN)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, signature, address, raidAddress } = req.body;

  if (!message || !signature || !address || !raidAddress) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const winningTicket = await getWinningTicket(raidAddress, req);

  if (!winningTicket || winningTicket[1] !== address) {
    return res.status(400).json({ error: 'You did not win' });
  }

  const isValidSignature = await verifySignature(message, signature, winningTicket[1]);

  if (!isValidSignature) {
    return res.status(401).json({ error: 'Invalid signature for winner' });
  }

  const specificAccounts = await getTwitters(raidAddress, req);

  console.log(specificAccounts)

  const twitterHandle = winningTicket[2];

  try {
    const user = await readOnlyClient.v2.userByUsername(twitterHandle);
    if (!user) {
      return res.status(404).json({ error: 'Twitter handle not found' });
    }
  
    const userId = user.data.id;
  
    const follows = await Promise.all(
      specificAccounts.map(async (accountId) => {
        try {
          const response = await readOnlyClient.v2.following(userId, { 'target_user_id': accountId });
          return response.data;
        } catch (error) {
          console.error(`Error checking following status for account ${accountId}:`, error);
          return false;
        }
      })
    );
  
    const followsAll = follows.every((follow) => follow);
  
    return res.status(200).json({ followsAll });
  } catch (error) {
    console.error('Twitter API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
  
};

export default handler;
