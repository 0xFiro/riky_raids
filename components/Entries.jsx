import styles from "@/styles/Raids.module.css";
import Image from "next/image";
import config from "@/rikyRaidConfig.json"
import ABI from "@/functions/ABI.json"
import {Contract, formatEther, formatUnits, isAddress, JsonRpcProvider} from "ethers";
import {useEffect, useState} from "react";
import {useWeb3ModalAccount} from "@web3modal/ethers/react";
import timeTill from "@/functions/timeTill";
import GameOver from "./GameOver";
import formatNumber from "@/functions/formatNumba";

const Entries = ({
                     setLoading,
                     raidId,
                     setBuyInfo,
                     setBuying,
                     alert,
                     buying,
                     loading,
                     raidedAsset,
                     setRaidedAsset,
                     address,
                     setAddress,
                     loot
                 }) => {

    const {isConnected} = useWeb3ModalAccount()

    const [baseUri, setBaseUri] = useState("")
    const [nftData, setNftData] = useState([])
    const [endBlock, setEndblock] = useState(0)
    const [endBlockTimeRemaining, setEndBlockTimeRemaining] = useState("--");

    const nftAmount = Array.from({length: 5}, (e, i) => i + 1);

    const getURI = async () => {
        try {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const provider = new JsonRpcProvider(`${baseUrl}/api/rpc`);
            const raidMasterContract = new Contract(config.raidMaster, ABI.raidMaster, provider)
            const raidAddress = await raidMasterContract.raids(raidId)
            const raidContract = new Contract(raidAddress, ABI.raid, provider)
            const uri = await raidContract.uri(0)
            const endBlock = await raidContract.endBlock()
            const assetAddy = await raidContract.assetAddress()
            const raidAssetContract = new Contract(assetAddy, ABI.erc20, provider)
            const assetName = await raidAssetContract.name()
            setEndblock(parseInt(endBlock))
            setRaidedAsset(assetName)
            await getNftData(raidAddress)
            await getTicketPurchased(raidAddress)
            setAddress(raidAddress)
            setBaseUri(uri)
        } catch (e) {
            console.log(e)
        }
    }

    const getNftData = async (contract) => {
        try {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const provider = new JsonRpcProvider(`${baseUrl}/api/rpc`);
            const raidContract = new Contract(contract, ABI.raid, provider);
            const data = await raidContract.getTokenInfos();
            getMeta(data)
        } catch (e) {
            console.log(e);
        }
    };

    const getTicketPurchased = async (contract) => {
        try {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const provider = new JsonRpcProvider(`${baseUrl}/api/rpc`);
            const raidContract = new Contract(contract, ABI.raid, provider);
            const data = await raidContract.ticketsPurchased();
        } catch (e) {
            console.log(e);
        }
    };


    const updateQty = async () => {
        try {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const provider = new JsonRpcProvider(`${baseUrl}/api/rpc`);
            const raidContract = new Contract(address, ABI.raid, provider);
            const data = await raidContract.getTokenInfos();

            const fetchPromises = data.map(async (e) => {
                const req = await fetch(e[0], {});
                const res = await req.json();
                let tempObj = res
                tempObj.qty = e[1]
                tempObj.max = e[2]
                tempObj.price = e[3]
                return tempObj;
            });

            const meta = await Promise.all(fetchPromises);
            setNftData(meta);

        } catch (e) {
            console.log(e);
        }
    };

    const getMeta = async (data) => {
        try {
            const fetchPromises = data.map(async (e) => {
                const req = await fetch(e[0], {});
                const res = await req.json();
                let tempObj = res
                tempObj.qty = e[1]
                tempObj.max = e[2]
                tempObj.price = e[3]
                return tempObj;
            });
            const meta = await Promise.all(fetchPromises);
            setNftData(meta);
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => setLoading(false), 1000)
        }
    };


    const openBuyModal = (nftInfo, id) => {
        let tempobj = nftInfo
        tempobj.id = id + 1
        if (isConnected) {
            setBuyInfo(tempobj)
            setBuying(true)
        } else {
            alert("info", "Please connect a wallet")
        }
    }

    const pullEndblockDiff = async () => {
        try {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const provider = new JsonRpcProvider(`${baseUrl}/api/rpc`);
            const currentBlock = await provider.getBlock()
            const endBlockSecondsTillEnd = (endBlock - currentBlock.number) * 2;
            updateEndblockTimeRemaining(endBlockSecondsTillEnd);
        } catch (e) {
            console.log(e);
        }
    }

    const updateEndblockTimeRemaining = (seconds) => {
        const countdownTimer = setInterval(() => {
            seconds -= 1;
            if (seconds <= 0) {
                clearInterval(countdownTimer);
                setEndBlockTimeRemaining("Time's up!");
            } else {
                setEndBlockTimeRemaining(timeTill(seconds));
            }
        }, 1000);
    }

    useEffect(() => {
        endBlockTimeRemaining === "--" && endBlock !== 0 ? pullEndblockDiff() : null
    }, [endBlockTimeRemaining, endBlock]);

    useEffect(() => {
        !loading && isAddress(address) && updateQty()
    }, [loading])


    useEffect(() => {
        getURI()

    }, [])


    const calculateTotalQty = (items) => {
        let totalQty = 0n;
        let maxQty = 0n;

        for (const item of items) {
            if (item.qty !== undefined && item.qty !== null) {
                try {
                    totalQty += BigInt(item.qty);
                    maxQty += BigInt(item.max);
                } catch (error) {
                    console.error(`Invalid qty value for item ${item.name}:`, item.qty);
                }
            }
        }
        return {total: BigInt(totalQty).toLocaleString(), max: BigInt(maxQty).toLocaleString()};
    };
    return (<div className={buying ? "hidden" : styles.entriesWrap}>
            <div className={styles.entriesCont}>
                {endBlockTimeRemaining !== "Time's up!" && <div className={styles.target}>
                    <div>Target -&nbsp;
                        <div className={styles.targetValue}>{raidedAsset}</div>
                        <div className={styles.ticketsAvailableContainer}>
                            <div
                                className={styles.ticketsAvailable}>{calculateTotalQty(nftData).total}/{calculateTotalQty(nftData).max}
                            </div>
                            <p className={styles.ticketsAvailableText}>
                                Tickets
                                Available

                            </p>
                        </div>


                    </div>
                    <div className={styles.potPrize}>
                        <div>Prize</div>
                        <div className={styles.potValue}>{formatNumber(parseInt(formatUnits(loot)))} {raidedAsset}</div>
                    </div>
                    <div>Ends -&nbsp;
                        <div className={styles.targetValue}>{endBlockTimeRemaining}</div>
                    </div>
                </div>}
                <div className={styles.entriesItems}>
                    {baseUri !== "" && address !== "" && nftData[0] !== 0 && endBlockTimeRemaining !== "Time's up!" ? nftAmount.map((e, index) => {
                        const match = nftData[index];
                        let tempOBJ = match
                        tempOBJ.raidContract = address
                        tempOBJ.id = index + 1
                        return (<div key={index} className={styles.itemWrap}>
                                <div onClick={() => openBuyModal(tempOBJ, index)} className={styles.itemCont}>
                                    <Image alt={"nft" + index} src={match.image} width={250} height={250}/>
                                    <div className={styles.itemName}>{match.name}</div>
                                    <div className={styles.price}>{parseInt(formatEther(match.price))} RIKY</div>
                                    <div className={styles.entryAmount}>{match.id}X Chances</div>
                                </div>
                                <div className={styles.quantity}>{parseInt(match.qty) + "/" + parseInt(match.max)}</div>
                            </div>)
                    }) : baseUri !== "" && address !== "" && nftData[0] !== 0 && endBlockTimeRemaining === "Time's up!" ?
                        <GameOver setLoading={setLoading} loot={loot} nftData={nftData} alert={alert}
                                  raidedAsset={raidedAsset} raidAddress={address}/> : null}
                    <div className={styles.break}></div>
                    {endBlockTimeRemaining !== "Time's up!" && <div className={styles.quantityLabel}>Available</div>}
                </div>
            </div>
        </div>)
}

export default Entries
