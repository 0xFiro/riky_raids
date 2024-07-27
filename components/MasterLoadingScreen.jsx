import Image from "next/image"

const MasterLoadingScreen = () => {

    return(
        <div className="loading">
            <Image alt={"rikyRunning"} width={200} height={200} src={"/images/rikyRunning.gif"} />
            <div className="loader"></div>
        </div>
    )
}

export default MasterLoadingScreen