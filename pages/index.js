import styles from "@/styles/Index.module.css"
import Image from "next/image"
import { useEffect } from "react"
import HomeCards from "@/components/HomeCards"
import Wrapper from "@/components/Wrapper"

const Index = ({setLoading,alert}) => {

    useEffect(() => {
        setTimeout(()=>{
            setLoading(false)
        },4000)
    }, [])
    
    return(
        <Wrapper>
            <div className={styles.cont1}>
                <div className={styles.contCol}>
                    <Image src={"/images/riky.png"} width={400} height={165} />
                    <div className={styles.subHead}>
                        The Brand and marketing token on Base.
                    </div>
                    <a href={"https://app.uniswap.org/swap?outputCurrency=0x729031B3995538DDF6B6BcE6E68D5D6fDEb3CCB5&chain=base"} target={"_blank"} className={styles.button1}>
                        Buy $RIKY
                    </a>
                </div>
                <div className={styles.contCol}>
                    <Image src={"/images/bigriky.jpg"} width={641} height={644} />
                </div>
            </div>
            <HomeCards />
        </Wrapper>
    )
}

export default Index