import AdSlot from "./AdSlot";

function BannerAd({ position = "homepage", size = "banner", className = "" }) {
  return <AdSlot position={position} size={size} className={className} />;
}

export default BannerAd;
