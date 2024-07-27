import styles from "@/styles/Raids.module.css"
import { isAddress } from "ethers"
import config from "@/rikyRaidConfig.json"
import { shortenEthAddy } from "@/functions/shortenEthAddy"

const ContractFooter = ({address}) => {
    
    return(address !== "" && isAddress(address) &&
        <a href={`${config.blockExplorer}/address/${address}`} target={"_blank"} className={styles.contractFooter}>
            {shortenEthAddy(address)}
        </a>
    )
}

export default ContractFooter