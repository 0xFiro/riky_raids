import styles from "@/styles/Raids.module.css"
import config from "@/rikyRaidConfig.json"
import ABI from "@/functions/ABI.json"
import { BrowserProvider, Contract, formatEther, isAddress, formatUnits } from "ethers";
import { useEffect, useState } from "react";
import { useWeb3ModalProvider,useWeb3ModalAccount } from "@web3modal/ethers/react";
import Image from "next/image";
import formatNumber from "@/functions/formatNumba";

const BuyModal = ({nftInfo,setBuying,buying,alert,setLoading,raidedAsset,lootAsset,loot}) => {

    const { address } = useWeb3ModalAccount()
    const [button,setButton] = useState("Approve")
    const {walletProvider} = useWeb3ModalProvider();

    const [twitters,setTwitters] = useState([])
    const [xInput,setxInput] = useState("")

    const checkApproval = async () => {
        try{
            const provider = new BrowserProvider(walletProvider);
            const rikyContract = new Contract(config.rikyAddress,ABI.riky,provider)
            const approval = await rikyContract.allowance(address,nftInfo.raidContract)
            approval >= nftInfo.price ? setButton("Purchase") : setButton("Approve")
            } catch (e) {
                console.log(e)
            }
    }

    const approve = async () => {
        try{
            const provider = new BrowserProvider(walletProvider);
            const signer = await provider.getSigner()
            const rikyContract = new Contract(config.rikyAddress,ABI.riky,signer)
            const approval = await rikyContract.approve(nftInfo.raidContract, nftInfo.price)
            setLoading(true)
            await approval.wait()
            } catch (e) {
                alert("error",e.reason)
                setLoading(true)
                console.log(e)
            } finally {
                checkApproval()
                setLoading(false)
            }
    }

    const buy = async () => {
        if(xInput === "") {
            alert("error","Twitter handle required!")
            return
        }
        try{
            const provider = new BrowserProvider(walletProvider);
            const signer = await provider.getSigner()
            const raidContract = new Contract(nftInfo.raidContract,ABI.raid,signer)
            const purchase = await raidContract.buyBatch(parseInt(nftInfo.id),xInput)
            setLoading(true)
            await purchase.wait()
            } catch (e) {
                setLoading(false)
                alert("error",e.reason)
                console.log(e)
            } finally {
                checkApproval()
                setBuying(false)
                setLoading(false)
            }
    }

    const getRaidSocialsAndPot = async () => {
        try{
            const provider = new BrowserProvider(walletProvider);
            const raidContract = new Contract(lootAsset,ABI.raid,provider)
            const assetAddy = await raidContract.assetAddress()
            const lootContract = new Contract(assetAddy,ABI.erc20,provider)
            const socials1 = await raidContract.twitters(0)
            const socials2 = await raidContract.twitters(1)
            console.log([socials1,socials2])
            setTwitters([socials1,socials2])
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        isAddress(address) && getRaidSocialsAndPot() && checkApproval()
    }, [address])
    

    return(
        <div className={buying ? styles.entriesWrap : "hidden"}>
            <div className={styles.buyModal}>
            <div className={styles.itemWrap}>
                <div className={styles.buyCont}>
                    <Image alt={"nft"+nftInfo.id} src={nftInfo.image} width={250} height={250} />
                    <div className={styles.itemName}>{nftInfo.name}</div>
                </div>
            </div>
            <div className={styles.itemWrap}>
                <div className={styles.buyRow}>
                    <div className={styles.buyInfoRow}><div>Available:</div><div>{parseInt(nftInfo.qty)}</div></div>
                    <div className={styles.buyInfoRow}><div>Cost:</div><div>{formatNumber(parseInt(formatEther(nftInfo.price)))} RIKY</div></div>
                    <div className={styles.buyInfoRow}><div>Entries:</div><div>{nftInfo.id}</div></div>
                    <div className={styles.buyInfoRow}><div>Your twitter:</div><input value={xInput} onChange={(e)=>setxInput(e.target.value)} placeholder={"kingsimpa69"} /></div>
                </div>
                <div>
                    {button === "Approve" && <div className={styles.remaining}>Approve {parseInt(formatEther(nftInfo.price))} RIKY</div>}
                    <div className={styles.buttonRow}>
                        <div onClick={()=> setBuying(false)} className={styles.invertedBuyModalButton}>{"Back"}</div>
                        <div onClick={()=> button === "Approve" ? approve() : buy()} className={styles.buyModalButton}>{button}</div>
                    </div>
                </div>
            </div>
            </div>
            <div className={styles.socialsTargetCont}>
                <div>
                    <div>Prize</div>
                    <div>{formatNumber(parseInt(formatUnits(loot)))} {raidedAsset}</div>
                </div>
                <div>
                    <div>Target Socials</div>
                    <div className={styles.socialCol}>
                        {twitters.length > 0 && twitters.map((e)=>{
                            return(
                                <a target={"_blank"} href={e}><Image src={"/images/twitter.svg"} width={40} height={40} /></a>
                            )
                        })}
                    </div>
                    <div className={styles.socialDisclaim}>*Must follow</div>

                </div>
            </div>
        </div>
    )
}

export default BuyModal