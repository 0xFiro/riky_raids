import DeployRaid from "@/components/DeployRaid";
import RaidMaster from "@/components/RaidMaster";
import RikyRaidTitles from "@/components/RikyRaidTitles";
import Wrapper from "@/components/Wrapper";
import { useState } from "react";

const Admin = ({setLoading,alert}) => {

  const [page,setPage] = useState(0)
  
return (
  <Wrapper>
    <RikyRaidTitles subTitle={"Admin page"} />
    <div className={"adminPageToggle"}>
      <div onClick={()=>setPage(0)} className={page === 0 ? "adminToggleActive" : null}>Deploy</div>
      <div onClick={()=>setPage(1)} className={page === 1 ? "adminToggleActive" : null}>RaidMaster</div>
    </div>
    {page === 0 && <DeployRaid setLoading={setLoading} alert={alert}/>}
    {page === 1 && <RaidMaster setLoading={setLoading} alert={alert}/>}
  </Wrapper>
);
}

export default Admin