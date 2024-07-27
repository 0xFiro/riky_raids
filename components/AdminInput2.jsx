import styles from "@/styles/Raids.module.css"

const AdminInput2 = ({index,value,label,placeholder,handleInputs}) => {

    return(
        <div className={styles.adminInput2}>
            <div>{label[index]}</div>
            <input value={value[index]} onChange={(e)=>handleInputs(index,e.target.value)} placeholder={placeholder[index]} />
        </div>
    )
}

export default AdminInput2