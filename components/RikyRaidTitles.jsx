import styles from "@/styles/Raids.module.css";
import Image from "next/image";
import { useWindowSize } from "@/hooks/useWindowSize";

const RikyRaidTitles = ({subTitle}) => {

  const {width} = useWindowSize()

    return(
        <div className={styles.cont1}>
          { width > 1045 ?
            <Image src={"/images/rikyRaid.png" } alt={"riky-title"} width={423} height={114} /> :
            <Image src={"/images/rikyRaid.png" } alt={"riky-title"} width={300} height={81} />
          }
          <div className={styles.subHeader}>{subTitle}</div>
        </div>
    )
}

export default RikyRaidTitles