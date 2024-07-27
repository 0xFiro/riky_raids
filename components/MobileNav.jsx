import styles from "@/styles/MoblieNav.module.css"
import Link from "next/link"
import { useRouter } from "next/router";
import { useState,useEffect } from "react";
import { useWeb3ModalAccount } from '@web3modal/ethers/react'
import ABI from "@/functions/ABI.json"
import config from "@/rikyRaidConfig.json"
import { isAddress, JsonRpcProvider, Contract } from "ethers"

const MobileNav = ({mobileNav,toggleMobileNav}) => {

    const router = useRouter();
    const { address, chainId, isConnected } = useWeb3ModalAccount()
    const [wallet,setWallet] = useState("")
    const [raidMaster,setRaidMaster] = useState(false)

    const switchPage = (page) => {
        router.push(page)
        toggleMobileNav(false)
    }

    const raidMasterCheck = async () => {
        try{
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const provider = new JsonRpcProvider(`${baseUrl}/api/rpc`);
        const raidMasterContract = new Contract(config.raidMaster,ABI.raidMaster,provider)
        const owner = await raidMasterContract.owner()
        owner.toLowerCase() === wallet.toLowerCase() ? setRaidMaster(true) : setRaidMaster(false)
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        isConnected ? setWallet(address) : setWallet("")
    }, [address,isConnected])

    useEffect(() => {
        raidMasterCheck()
    }, [wallet])

    return(mobileNav &&
        <div className={styles.wrap}>
                <button onClick={()=>toggleMobileNav(false)} className={`hamburger ${styles.hammy} hamburger--collapse`} type="button">
                    <span className="hamburger-box">
                      <span className="hamburger-inner"></span>
                    </span>
                </button>
                <div onClick={()=>switchPage("/")} className={router.pathname === "/" ? styles.itemActive : styles.item}>Home</div>
                <div onClick={()=>switchPage("/raids")} className={router.pathname === "/raids" ? styles.itemActive : styles.item}>Raid NFTs</div>
                <div onClick={()=>switchPage("/raids")} className={router.pathname === "/lottery" ? styles.itemActive : styles.item}>Lottery</div>
                {raidMaster ? <div onClick={()=>switchPage("/admin")} className={router.pathname === "/admin" ? styles.itemActive : styles.item}>Admin</div>:null}
        </div>
)

}

export default MobileNav