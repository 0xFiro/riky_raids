import Image from "next/image"

const MasterLoadingScreen = () => {

    return(
        <div className="loading">
            <img src={"/images/rikyRunning.gif"} />
            <div className="loader"></div>
        </div>
    )
}

export default MasterLoadingScreen