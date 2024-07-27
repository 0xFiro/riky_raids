import styles from "@/styles/Raids.module.css"
import config from "@/rikyRaidConfig.json"
import ABI from "@/functions/ABI.json"
import { JsonRpcProvider, BrowserProvider, Contract, formatEther, isAddress } from "ethers";
import { useWeb3ModalProvider } from "@web3modal/ethers/react";
import { useEffect, useState } from "react";
import { useWindowSize } from "@/hooks/useWindowSize";
import { shortenEthAddy } from "@/functions/shortenEthAddy";

const RaidMaster = ({setLoading,alert}) => {

    const {width} = useWindowSize()
    const [raidMasterStuff,setRaidMasterStuff] = useState([])
    const [ownerInput,setOwnerInput] = useState("")
    const [inputs,setInputs] = useState({1:"",2:"",3:""})
    const {walletProvider} = useWeb3ModalProvider();

    const labels = [
        "ORACLE ADDRESS",
        "MARKETING ADDRESS",
        "STAKING ADDRESS"
    ]

    const handleInputs = (type, value) => {
        setInputs(prevInputs => ({
            ...prevInputs,
            [type]: value
        }));
    };

    const allocations = async () => {
        try{
            const provider = new BrowserProvider(walletProvider);
            const signer = await provider.getSigner()
            const raidContract = new Contract(config.raidMaster,ABI.raidMaster,signer)
            const tx = await raidContract.handleDistributions()
            setLoading(true)
            await tx.wait()
            getWinner()
        } catch (e) {
                setLoading(false)
                alert("error",e.reason)
                console.log(e)
        } finally {
            setLoading(false)
        }
    }

    const getRaidMasterStuff = async () => {
        try{
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const provider = new JsonRpcProvider(`${baseUrl}/api/rpc`);
        const raidMasterContract = new Contract(config.raidMaster,ABI.raidMaster,provider)
        const rickyContract = new Contract(config.rikyAddress,ABI.riky,provider)
        const balance = await rickyContract.balanceOf(config.raidMaster)
        const owner = await raidMasterContract.owner()
        const oracle = await raidMasterContract.ORACLE_ADDRESS()
        const marketing = await raidMasterContract.MARKETING_ADDRESS()
        const staking = await raidMasterContract.STAKING_ADDRESS()
        setRaidMasterStuff([parseInt(formatEther(balance)),oracle,marketing,staking,owner])
        } catch (e) {
            console.log(e)
        }
    }

    const updateAddy = async (type) => {
        if(!isAddress(inputs[type])){
            alert("error","Invalid ethereum address")
            return
        }
        try{
            const provider = new BrowserProvider(walletProvider);
            const signer = await provider.getSigner()
            const raidMasterContract = new Contract(config.raidMaster,ABI.raidMaster,signer)
            const tx = await raidMasterContract.updateAddress(type,inputs[type])
            setLoading(true)
            await tx.wait()
            } catch (e) {
                setLoading(false)
                alert("error",e.reason)
                console.log(e)
            } finally {
                setInputs({1:"",2:"",3:""})
                getRaidMasterStuff()
                setLoading(false)
            }
    }

    const updateRaidMasterWallet = async (addy) => {
        if(!isAddress(addy)){
            alert("error","Invalid ethereum address")
            return
        }
        try{
            const provider = new BrowserProvider(walletProvider);
            const signer = await provider.getSigner()
            const raidMasterContract = new Contract(config.raidMaster,ABI.raidMaster,signer)
            const tx = await raidMasterContract.transferOwnership(addy)
            setLoading(true)
            await tx.wait()
            } catch (e) {
                setLoading(false)
                alert("error",e.reason)
                console.log(e)
            } finally {
                setOwnerInput("")
                getRaidMasterStuff()
                setLoading(false)
            }
    }

    useEffect(() => {
        getRaidMasterStuff()
    }, [])

    return(
        <div className={styles.cont2}>
          <div className={styles.adminPanel}>{
            raidMasterStuff.length > 0 &&
                <>
                    <div className={styles.adminBalance}>Balance <div className={styles.adminBalanceValue}>{raidMasterStuff[0]} RIKY</div></div>
                    <div onClick={()=>allocations()} className={styles.bigButton}>Allocate Balance</div>
                    <div className={styles.adminInputs3}>
                    <div className={styles.adminInput3}>
                                <div>Transfer Ownership</div>
                                <input onChange={(e)=>setOwnerInput(e.target.value)} value={ownerInput} placeholder={width < 1045 ? shortenEthAddy(raidMasterStuff[4]) : raidMasterStuff[4]} />
                                <div onClick={()=>updateRaidMasterWallet(ownerInput)}>Write</div>
                            </div>
                        {
                            labels.map((e,index)=>{
                                const type = e === "ORACLE ADDRESS" ? 3 :
                                e === "MARKETING ADDRESS" ? 1 :
                                e === "STAKING ADDRESS" ? 2 : null
                            return (
                            <div className={styles.adminInput3}>
                                <div>{e}</div>
                                <input onChange={(e)=>handleInputs(type,e.target.value)} value={inputs[type]} placeholder={width < 1045 ? shortenEthAddy(raidMasterStuff[index+1]) : raidMasterStuff[index+1]} />
                                <div onClick={()=>updateAddy(type)}>Write</div>
                            </div>
                            )
                            })
                        }

                    </div>
                </>
          }</div>
        </div>
    )
}

export default RaidMaster