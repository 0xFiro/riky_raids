import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import { Web3Modal } from "@/context/context";
import { useState } from "react";
import "@/styles/globals.css";
import "@/styles/hamburgers.css"
import 'animate.css';
import MasterLoadingScreen from "@/components/MasterLoadingScreen";
import Alert from "@/components/Alert";
import Credit from "@/components/Credit";

export default function App({ Component, pageProps }) {

  const [mobileNav,toggleMobileNav] = useState(false)
  const [loading,setLoading] = useState(true)
  const [alerts,setAlerts] = useState([])
  const alert = (type,message,tx) => {
    setAlerts(alerts=>[...alerts,{
      type:type,
      message:message,
      tx:tx
    }])
  }

  return (
    <Web3Modal>
      <Alert setAlerts={setAlerts} alerts={alerts} />
      {loading && <MasterLoadingScreen />}
      <MobileNav toggleMobileNav={toggleMobileNav} mobileNav={mobileNav}/>
      <Header toggleMobileNav={toggleMobileNav} />
      <Component {...pageProps} setLoading={setLoading} alert={alert} loading={loading} />
      <Credit />
    </Web3Modal>
  );
}
