import styles from "@/styles/Raids.module.css";
import AdminInput1 from "@/components/AdminInput1";
import AdminInput2 from "@/components/AdminInput2";
import { useEffect, useState } from "react";
import { isAddress, BrowserProvider, Contract, parseEther } from "ethers";
import config from "@/rikyRaidConfig.json"
import ABI from "@/functions/ABI.json"
import { useWeb3ModalProvider } from "@web3modal/ethers/react";
import { useRouter } from "next/router";
import byteCode from "@/contracts/bytecode.json"

const DeployRaid = ({setLoading,alert}) => {

    const router = useRouter()
    const {walletProvider} = useWeb3ModalProvider();
    const [validated,setValidated] = useState(false)

    const inputs = [
      "Entry Price",
      "Game duration",
      "Asset address",
      "NFT URI",
      "Quantity",
      "Quantity",
      "Quantity",
      "Quantity",
      "Quantity",
      "Twitter #1",
      "Twitter #2"
    ]
  
    const placeholders = [
      "1000 (RIKY)",
      "100 (Blocks)",
      "0x69 (Raided Token)",
      "Raid URI (BASE URI)",
      "(1 Entries)",
      "(2 Entries)",
      "(3 Entries)",
      "(4 Entries)",
      "(5 Entries)",
      "https://x.com/RikyOnBase",
      "https://x.com/based_fellas"
    ]

    const [inpt,setInpt] = useState(["","","","","","","","","","",""])

    const deployRaid = async () => {
      try{
        const provdier = new BrowserProvider(walletProvider)
        const signer = await provdier.getSigner()
        const contract = new Contract(config.raidMaster,ABI.raidMaster,signer)
        const tx = await contract.createRaid(parseEther(inpt[0]),inpt[1],inpt[2],inpt[3],[inpt[4],inpt[5],inpt[6],inpt[7],inpt[8]],byteCode.raid,[inpt[9],inpt[10]])
        const result = await tx.wait()
        setLoading(true)
        //console.log(result.logs[0].args[0])
        router.push(`/${parseInt(result.logs[0].args[0])}`)
      } catch (e) {
        setLoading(false)
        alert("error",e.reason)
        console.log(e)
      }
    }


    const filters = {
      0: (value) => isNaN(value) ? value.replace(/\D/g, "") : value.slice(0, 9),
      1: (value) => isNaN(value) ? value.replace(/\D/g, "") : value,
      2: (value) => isAddress(value) ? value : "",
      3: (value) => value,
      4: (value) => isNaN(value) ? value.replace(/\D/g, "") : value.slice(0, 5),
      5: (value) => isNaN(value) ? value.replace(/\D/g, "") : value.slice(0, 5),
      6: (value) => isNaN(value) ? value.replace(/\D/g, "") : value.slice(0, 5),
      7: (value) => isNaN(value) ? value.replace(/\D/g, "") : value.slice(0, 5),
      8: (value) => isNaN(value) ? value.replace(/\D/g, "") : value.slice(0, 5),
      9: (value) => value,
      10: (value) => value,
    };

    const validateInputs = (inputs) => {
      for (let i = 0; i < inputs.length; i++) {
        const value = filters[i](inputs[i]);
        if (value === "") {
          return false;
        }
      }
      return true;
    };

    const handleInputs = (index, value) => {
      const filteredValue = filters[index](value);
      const tempInputs = [...inpt];
      tempInputs[index] = filteredValue;
      setInpt(tempInputs);

      const allValid = validateInputs(tempInputs);
      setValidated(allValid);
    }

    useEffect(() => {
      setTimeout(()=>{
          setLoading(false)
      },4000)
    }, [])

    return(
        <div className={styles.cont2}>
          <div className={styles.adminPanel}>
            <div className={styles.adminInputs1}>
            {inputs.slice(0,4).map((e,index)=>{
              return(
                <AdminInput1 key={index} value={inpt} index={index} handleInputs={handleInputs} label={inputs} placeholder={placeholders} />
              )
            })}
            </div>
            <div className={styles.adminInputs2}>
            {inputs.slice(4,9).map((e,index)=>{
              return(
                <AdminInput2 key={index+4} value={inpt} index={index+4} handleInputs={handleInputs} label={inputs} placeholder={placeholders} />
              )
            })}
            </div>
            <div className={styles.adminInputs1}>
            {inputs.slice(9,11).map((e,index)=>{
              return(
                <AdminInput1 key={index+9} value={inpt} index={index+9} handleInputs={handleInputs} label={inputs} placeholder={placeholders} />
              )
            })}
            </div>
            <button className={validated?styles.adminPanelButton:styles.inactive} onClick={()=>validated ? deployRaid() : alert("info", "Incorrect params")}>Deploy</button>
          </div>
        </div>
    )
}

export default DeployRaid