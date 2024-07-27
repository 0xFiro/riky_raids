import Wrapper from "@/components/Wrapper";
import RikyRaidTitles from "@/components/RikyRaidTitles";
import RaidzTable from "@/components/RaidzTable";
import { useEffect } from "react";

const Home = ({setLoading}) => {

  useEffect(() => {
    setTimeout(()=>{
        setLoading(false)
    },4000)
  }, [])

  return (
    <Wrapper>
      <RikyRaidTitles subTitle={"Select from the projects we are currently raiding"} />
      <RaidzTable />
    </Wrapper>
  );
}

export default Home
