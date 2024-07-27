import styles from "@/styles/Header.module.css"
import Image from "next/image"
import Web3Button from "./Web3Button"
import Link from "next/link"
import { useRouter } from 'next/router'
import { useWeb3ModalAccount } from '@web3modal/ethers/react'
import { useState,useEffect } from "react";
import { isAddress, JsonRpcProvider, Contract } from "ethers"
import ABI from "@/functions/ABI.json"
import config from "@/rikyRaidConfig.json"
import { useWindowSize } from "@/hooks/useWindowSize"

const Header = ({toggleMobileNav}) => {

    const router = useRouter();
    const { address, chainId, isConnected } = useWeb3ModalAccount()
    const {width} = useWindowSize()
    const [wallet,setWallet] = useState("")
    const [raidMaster,setRaidMaster] = useState(false)

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
    
    return(
        <div className={styles.headerWrap}>
            <div className={styles.logo}>
                <Link href={"/"}><Image alt={"riky-logo"} src={"/images/riky1.png"} width={161} height={177} /></Link>
                { width > 1045 ?
                <><Link href={"/"}><div className={router.pathname === "/" ? styles.itemActive : styles.item}>Home</div></Link>
                <Link href={"/raids"}><div className={router.pathname === "/raids" ? styles.itemActive : styles.item}>Raid NFTs</div></Link>
                <div className={router.pathname === "/lottery" ? styles.itemActive : styles.item}>Lottery</div>
                {raidMaster ? <Link href={"/admin"}><div className={router.pathname === "/admin" ? styles.itemActive : styles.item}>Admin</div></Link>:null}</> :
                <button onClick={()=>toggleMobileNav(true)} className={`hamburger ${styles.hammy}`} type="button">
                    <span className="hamburger-box">
                      <span className="hamburger-inner"></span>
                    </span>
                </button>
                }

            </div>
            <Web3Button/>
        </div>
    )
}

export default Header