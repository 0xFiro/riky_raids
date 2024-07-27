import styles from "@/styles/Raids.module.css"
import config from "@/rikyRaidConfig.json"
import ABI from "@/functions/ABI.json"
import { JsonRpcProvider, BrowserProvider, Contract, formatEther } from "ethers";
import { useWeb3ModalProvider } from "@web3modal/ethers/react";
import { useEffect, useState } from "react";

const RaidMaster = ({setLoading,alert}) => {

    const [raidMasterStuff,setRaidMasterStuff] = useState([])
    const {walletProvider} = useWeb3ModalProvider();

    const labels = [
        "ORACLE ADDRESS",
        "MARKETING ADDRESS",
        "STAKING ADDRESS"
    ]

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
                                <input placeholder={raidMasterStuff[4]} />
                                <div>Write</div>
                            </div>
                        {
                            labels.map((e,index)=>{
                            return (
                            <div className={styles.adminInput3}>
                                <div>{e}</div>
                                <input placeholder={raidMasterStuff[index+1]} />
                                <div>Write</div>
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