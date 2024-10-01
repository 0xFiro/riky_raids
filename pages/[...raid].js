import { useRouter } from 'next/router'
import { useEffect,useState } from "react";
import config from "@/rikyRaidConfig.json"
import ABI from "@/functions/ABI.json"
import { JsonRpcProvider, Contract, isAddress } from "ethers";
import RikyRaidTitles from "@/components/RikyRaidTitles";
import Wrapper from "@/components/Wrapper";
import Entries from '@/components/Entries';
import BuyModal from '@/components/BuyModal';
import ContractFooter from '@/components/ContractFooter';

const Raid = ({setLoading,alert,loading}) => {

  const router = useRouter();
  const [validRaid,setValidRaise] = useState(false)
  const [buying,setBuying] = useState(false)
  const [nftInfo,setBuyInfo] = useState({})
  const [raidedAsset, setRaidedAsset] = useState("")
  const [address,setAddress] = useState("")
  const [loot,setLoot] = useState(0)

  const gameCheck = async (slug) => {
    try{
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const provider = new JsonRpcProvider(`${baseUrl}/api/rpc`);
    const raidMasterContract = new Contract(config.raidMaster,ABI.raidMaster,provider)
    const gameContract = await raidMasterContract.raids(slug)
    gameContract === "0x0000000000000000000000000000000000000000" ? alert("error","Invalid raid ID") :
    setValidRaise(true)
    } catch (e) {
        console.log(e)
    }
  }

  const getPot = async (address) => {
    console.log(address)
    try{
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const provider = new JsonRpcProvider(`${baseUrl}/api/rpc`);
        const raidContract = new Contract(address,ABI.raid,provider)
        const assetAddy = await raidContract.assetAddress()
        const lootContract = new Contract(assetAddy,ABI.erc20,provider)
        const pot = await lootContract.balanceOf(address)
        setLoot(pot)
    } catch (e) {
        console.log(e)
    }
}
  useEffect(() => {
    isAddress(address) && getPot(address)

  }, [address])


  useEffect(() => {
    setLoading(true)
    if(router.query.raid !== undefined){
      !isNaN(router.query.raid[0]) ? gameCheck(router.query.raid[0]) : alert("error","Invalid raid ID")
    }
  }, [router])

  return (
    <><Wrapper>
      <RikyRaidTitles subTitle={"Purchase a redeemable NFT to help your project claim the stolen tokens."} />
      {validRaid && nftInfo.raidContract !== undefined &&
        <BuyModal
          loot={loot}
          setLoot={setLoot}
          lootAsset={address}
          raidedAsset={raidedAsset}
          alert={alert} buying={buying}
          setBuying={setBuying}
          nftInfo={nftInfo}
          setLoading={setLoading} />}
      {validRaid &&
        <Entries
          loot={loot}
          address={address}
          setAddress={setAddress}
          raidedAsset={raidedAsset}
          setRaidedAsset={setRaidedAsset}
          loading={loading} buying={buying}
          alert={alert} setBuying={setBuying}
          setBuyInfo={setBuyInfo}
          raidId={router.query.raid[0]}
          setLoading={setLoading} />}
    </Wrapper><ContractFooter address={address} /></>
  );
}

export default Raid
