import styles from"@/styles/Raids.module.css"
import config from "@/rikyRaidConfig.json"
import ABI from "@/functions/ABI.json"
import { JsonRpcProvider, Contract, formatEther, isAddress, BrowserProvider } from "ethers";
import { useWeb3ModalProvider,useWeb3ModalAccount } from "@web3modal/ethers/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useWindowSize } from "@/hooks/useWindowSize";
import { shortenEthAddy } from "@/functions/shortenEthAddy";

const GameOver = ({raidAddress,raidedAsset,alert,loot,setLoading}) => {

    const {width} = useWindowSize()
    const [winner,setWinner] = useState("")
    const { address } = useWeb3ModalAccount()
    const {walletProvider} = useWeb3ModalProvider();
    const [winningTicket,setWinningTicket] = useState([])
    const [oracleAddress,setOracleAddress] = useState("")
    const [oracleMode,setOracleMode] = useState(false)

    const getWinningTicket = async () => {
        try{
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const provider = new JsonRpcProvider(`${baseUrl}/api/rpc`);
        const raidContract = new Contract(raidAddress,ABI.raid,provider)
        const winningTicket = await raidContract.winningTicket()
        const winningTicketInfo = await raidContract.tickets(winningTicket)
        setWinningTicket([...winningTicketInfo,parseInt(winningTicket)])
        } catch (e) {
            console.log(e)
        }
    }

    const getOracle = async () => {
        try{
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const provider = new JsonRpcProvider(`${baseUrl}/api/rpc`);
        const raidMaster = new Contract(config.raidMaster,ABI.raidMaster,provider)
        const oracleAddy = await raidMaster.ORACLE_ADDRESS()
        setOracleAddress(oracleAddy)
        } catch (e) {
            console.log(e)
        }
    }

    const getWinner = async () => {
        try{
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const provider = new JsonRpcProvider(`${baseUrl}/api/rpc`);
        const raidContract = new Contract(raidAddress,ABI.raid,provider)
        const winningAddy = await raidContract.winner()
        setWinner(winningAddy)
        winningAddy !== "0x0000000000000000000000000000000000000000" && getWinningTicket()
        } catch (e) {
            console.log(e)
        }
    }

    const validateSocials = async (ticket) => {
        try{
            const provider = new BrowserProvider(walletProvider);
            const signer = await provider.getSigner()
            const raidContract = new Contract(raidAddress,ABI.raid,signer)
            const tx = await raidContract.verifySocials(ticket[4])
            setLoading(true)
            await tx.wait()
            getWinner()
        } catch (e) {
                alert("error",e.reason)
                setLoading(false)
                console.log(e)
        } finally {
            setLoading(false)
        }
    }

    const reveal = async () => {
        try{
        const provider = new BrowserProvider(walletProvider);
        const signer = await provider.getSigner()
        const raidContract = new Contract(raidAddress,ABI.raid,signer)
        const tx = await raidContract.endRaid()
        setLoading(true)
        await tx.wait()
        getWinner()
        } catch (e) {
            setLoading(false)
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    const checkSocial = async () => {
      try {

        alert("success","Socials aren't verified")

        // Automatic socials validation. Add an Twitter API key and uncomment

        //const message = "Validate twitter follows.";
        //const provider = new BrowserProvider(walletProvider);
        //const signer = await provider.getSigner();
        //const signature = await signer.signMessage(message);

        //const response = await fetch('/api/twitterOracle', {
        //  method: 'POST',
        //  headers: {
        //    'Content-Type': 'application/json',
        //  },
        //  body: JSON.stringify({
        //    message,
        //    signature,
        //    address,
        //    raidAddress,
        //  }),
        //});

        //const result = await response.json();
        //console.log(result);
      } catch (e) {
        console.log(e);
      }
    };

      

    const claimLoot = async () => {
        try{
        const provider = new BrowserProvider(walletProvider);
        const signer = await provider.getSigner()
        const raidContract = new Contract(raidAddress,ABI.raid,signer)
        const tx = await raidContract.claimLoot()
        setLoading(true)
        await tx.wait()
        } catch (e) {
            setLoading(false)
            alert("error",e.reason)
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        isAddress(raidAddress) && getWinner() && getOracle()
    }, [raidAddress])
    
    return(
        <>
            <div className={oracleMode ? styles.gameOverCont : "hidden"}>
                <div style={{ textAlign: "center" }} className={styles.header}>Oracle Menu</div>
                <div className={styles.target}>Address:&nbsp;<div className={styles.winner}>{winner === "0x0000000000000000000000000000000000000000" ? "REVEAL" : width > 1054 ? winner : shortenEthAddy(winner)}</div></div>
                <div className={styles.target}>Twitter:&nbsp;<div className={styles.wonAmount}>{winningTicket[2]}</div></div>
                <div className={styles.target}>Value:&nbsp;<div className={styles.wonAmount}>{parseInt(formatEther(loot))} {raidedAsset}</div></div>
                <div onClick={()=>validateSocials(winningTicket)} className={styles.bigButton}>Validate {winningTicket[2]}</div>
                <div onClick={()=>setOracleMode(false)} className={styles.bigButton}>Return</div>
            </div>
            
            <div className={!oracleMode ? styles.gameOverCont : "hidden"}>
                <div style={{ textAlign: "center" }} className={styles.header}>{winningTicket.length > 0 ? "Winner" : "Raid Complete"}</div>
                <div className={styles.target}>Address:&nbsp;<div className={styles.winner}>{winner === "0x0000000000000000000000000000000000000000" ? "REVEAL" : width > 1054 ? winner : shortenEthAddy(winner)}</div></div>
                <div className={styles.target}>Twitter:&nbsp;<div className={styles.wonAmount}>{winningTicket[2]}</div></div>
                <div className={styles.target}>Value:&nbsp;<div className={styles.wonAmount}>{parseInt(formatEther(loot))} {raidedAsset}</div></div>
                {winningTicket.length > 0 && winner !== address ? null :
                    <div className={styles.bigButton} onClick={() => winner === "0x0000000000000000000000000000000000000000" ? reveal() :
                        winner === address && !winningTicket[3] ? checkSocial() : claimLoot()}>
                        {winner === "0x0000000000000000000000000000000000000000" ? "Reveal" :
                            winner === address && !winningTicket[3] ? "Please contact team" : "Claim"}
                    </div>}
                {address === oracleAddress ? <div onClick={()=>setOracleMode(true)} className={styles.bigButton}>Oracle</div> : null}
            </div>
        </>
    )
}

export default GameOver