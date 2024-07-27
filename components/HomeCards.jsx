import styles from "@/styles/Index.module.css"
import homeCards from "@/homeCards.json"

const HomeCards = () => {

    return(
    <div className={styles.cont2}>
        {
            homeCards.map((e,index)=>{
                return(
                <div alt={"card"+index} className={styles.card}>
                    <div className={styles.cardTitle}>{e.title}</div>
                    <div className={styles.cardContent}>
                        {e.content}
                    </div>
                </div>
                )
            })
        }

    </div>
    )
}

export default HomeCards