// src/components/Onboarding.jsx

import { useState } from "react";
import parentRouteMap from "../assets/parent-route-map.png";
import liveJourneyMap from "../assets/live-journey-map.png";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  CircleCheck,
  MapPin,
  Navigation,
  Play,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

const slides = [
  {
    id: 1,
    eyebrow: "TRUST & SAFETY",
    title: (
      <>
        Every ride starts with a{" "}
        <span className="text-[#F2A900]">verified driver</span>
      </>
    ),
    description:
      "ASAN verifies drivers and their documents before they can serve families on the platform.",
    type: "verified",
    badge: "VERIFIED",
  },
  {
    id: 2,
    eyebrow: "LIVE JOURNEY",
    title: (
      <>
        Know where your child is,{" "}
        <span className="text-[#F2A900]">in real time</span>
      </>
    ),
    description:
      "Follow the trip with live GPS, trip status, route progress and timely location updates.",
    type: "tracking",
    badge: "LIVE",
  },
  {
    id: 3,
    eyebrow: "YOUR PARENT APP",
    title: "Your child’s school ride, in one place",
    description:
      "Set the route, see the monthly price before booking, and follow booking and trip updates from your dashboard.",
    type: "overview",
    badge: "ONE SIMPLE FLOW",
  },
  {
    id: 4,
    eyebrow: "RIDE UPDATES",
    title: "Know when your child is picked up and dropped off",
    description:
      "Follow the trip on the map and check pickup, journey, and drop-off updates in your parent app.",
    type: "guardian",
    badge: "TRIP UPDATES",
  },
];

function AppBrand() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFB400] shadow-[0_6px_14px_rgba(255,180,0,0.22)]">
        <Navigation size={18} className="text-black" strokeWidth={2.4} />
      </div>

      <div className="text-[20px] font-black tracking-[-0.03em] text-black">
        Asan<span className="text-[#F2A900]">rides</span>
      </div>
    </div>
  );
}

function DecorativeBackground() {
  return (
    <>
      <div className="pointer-events-none absolute -right-20 -top-28 h-[310px] w-[310px] rounded-full bg-[#FFF0BD]" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-[250px] w-[250px] rounded-full bg-[#FFF4D4]" />
      <div className="pointer-events-none absolute left-8 top-[44%] h-16 w-16 rounded-full bg-[#FFF7E4]" />
    </>
  );
}

function VerifiedVisual() {
  return (
    <div className="relative">
      <div className="rounded-[26px] border border-[#F6D995] bg-[#FFFDF8] p-5 shadow-[0_12px_30px_rgba(58,46,21,0.07)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A7850]">
              Current verification
            </p>
            <p className="mt-2 text-[20px] font-black text-black">
              Driver profile
            </p>
            <p className="mt-1 text-[12px] text-[#8E8173]">
              Identity • Vehicle • Documents
            </p>
          </div>

          <span className="rounded-full bg-[#FFF0B8] px-3 py-1.5 text-[10px] font-black text-[#9B6400]">
            VERIFIED
          </span>
        </div>

        <div className="mt-5 flex items-center gap-4 rounded-[20px] border border-[#F1E7D8] bg-white p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFB400]">
            <UserCheck size={27} className="text-black" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-black text-black">
              Verified ASAN Driver
            </p>
            <p className="mt-1 text-[11px] text-[#918779]">
              Approved for school rides
            </p>
          </div>

          <CircleCheck size={22} className="text-[#D38A00]" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <InfoCard
            icon={<ShieldCheck size={18} />}
            title="Safety check"
            subtitle="Completed"
          />
          <InfoCard
            icon={<Check size={18} />}
            title="Documents"
            subtitle="Approved"
          />
        </div>
      </div>
    </div>
  );
}

function TrackingVisual() {
  return (
    <div className="relative">
      <div className="rounded-[26px] border border-[#F6D995] bg-[#FFFDF8] p-5 shadow-[0_12px_30px_rgba(58,46,21,0.07)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A7850]">
              Live trip
            </p>
            <p className="mt-2 text-[20px] font-black text-black">School Route</p>
            <p className="mt-1 text-[12px] text-[#8E8173]">Home → School</p>
          </div>
          <span className="rounded-full bg-[#FFF0B8] px-3 py-1.5 text-[10px] font-black text-[#9B6400]">
            LIVE
          </span>
        </div>

        <div className="relative mt-5 h-[170px] overflow-hidden rounded-[20px] border border-[#F2E5D1] bg-[#FFF9EA]">
          <img
            src={liveJourneyMap}
            alt="Illustrated live journey map"
            className="h-full w-full object-cover"
            draggable={false}
          />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0B8] text-[#9B6400]">
                <MapPin size={17} />
              </span>
              <div>
                <p className="text-[12px] font-black text-black">Live journey</p>
                <p className="text-[10px] text-[#8E8173]">Location updates on the map</p>
              </div>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-[#26C281] shadow-[0_0_0_4px_rgba(38,194,129,0.12)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
function ParentOverviewVisual() {
  return (
    <div className="rounded-[26px] border border-[#F6D995] bg-[#FFFDF8] p-4 shadow-[0_12px_30px_rgba(58,46,21,0.07)]">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A7850]">
            Your child’s ride
          </p>
          <p className="mt-1.5 text-[17px] font-black text-black">
            Home <span className="text-[#D38A00]">→</span> School
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF0B8] text-[#9B6400]">
          <MapPin size={19} />
        </div>
      </div>

      <img
        src={parentRouteMap}
        alt="Illustrated route from home to school"
        className="mt-3 h-[142px] w-full rounded-[20px] border border-[#F2E5D1] object-cover"
        draggable={false}
      />

      <div className="mt-3 grid grid-cols-3 divide-x divide-[#F1E7D8] rounded-[18px] border border-[#F1E7D8] bg-white py-3 text-center">
        <p className="text-[10px] font-bold text-[#6F6254]">Plan route</p>
        <p className="text-[10px] font-bold text-[#6F6254]">See price</p>
        <p className="text-[10px] font-bold text-[#6F6254]">Track trip</p>
      </div>
    </div>
  );
}
function GuardianVisual() {
  return (
    <div className="rounded-[26px] border border-[#F6D995] bg-[#FFFDF8] p-5 shadow-[0_12px_30px_rgba(58,46,21,0.07)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A7850]">
            Trip status
          </p>
          <p className="mt-2 text-[18px] font-black text-black">Journey updates</p>
          <p className="mt-1 text-[12px] text-[#8E8173]">Pickup → Journey → Drop-off</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF0B8] text-[#D38A00]">
          <MapPin size={21} />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <StatusMiniCard time="Pickup" title="Picked up" status="Trip update" />
        <StatusMiniCard time="Drop-off" title="Reached school" status="Trip update" />
      </div>
    </div>
  );
}

function InfoCard({ icon, title, subtitle }) {
  return (
    <div className="rounded-[18px] border border-[#F1E7D8] bg-white p-4">
      <div className="text-[#D38A00]">{icon}</div>
      <p className="mt-3 text-[13px] font-black text-black">{title}</p>
      <p className="mt-1 text-[10px] text-[#8E8173]">{subtitle}</p>
    </div>
  );
}

function StatusMiniCard({ time, title, status }) {
  return (
    <div className="rounded-[18px] border border-[#F1E7D8] bg-white p-3.5">
      <p className="text-[10px] font-bold text-[#A18F7A]">{time}</p>
      <p className="mt-1 text-[13px] font-black text-black">{title}</p>
      <p className="mt-1 text-[10px] font-bold text-[#D38A00]">{status}</p>
    </div>
  );
}

function SlideVisual({ type }) {
  switch (type) {
    case "verified":
      return <VerifiedVisual />;
    case "tracking":
      return <TrackingVisual />;
    case "overview":
      return <ParentOverviewVisual />;
    case "guardian":
      return <GuardianVisual />;
    default:
      return null;
  }
}

function Onboarding({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = slides[currentSlide];
  const isFirst = currentSlide === 0;
  const isLast = currentSlide === slides.length - 1;

  const next = () => {
    if (isLast) {
      onComplete();
      return;
    }

    setCurrentSlide((prev) => prev + 1);
  };

  const back = () => {
    if (!isFirst) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[99990] overflow-y-auto bg-[#FFF9EF]">
      <DecorativeBackground />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-6 pt-5">
        <div className="flex items-center justify-between">
          <AppBrand />

          <button
            type="button"
            onClick={onComplete}
            className="rounded-2xl border border-[#E9DFC9] bg-white px-4 py-2 text-[12px] font-black text-black shadow-sm active:scale-95"
          >
            Skip
          </button>
        </div>

        <div className="mt-8">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C57F00]">
            {slide.eyebrow}
          </p>

          <h1 className="mt-2 max-w-[340px] text-[29px] font-black leading-[1.03] tracking-[-0.035em] text-black">
            {slide.title}
          </h1>

          <p className="mt-3 max-w-[345px] text-[13px] font-medium leading-5 text-[#84796A]">
            {slide.description}
          </p>
        </div>

        <div className="mt-6">
          <SlideVisual type={slide.type} />
        </div>

        <div className="mt-6">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C57F00]">
            WHY IT MATTERS
          </p>

          <div className="mt-3 flex items-center justify-between rounded-[22px] border border-[#F0DFC0] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(66,48,19,0.05)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF0B8] text-[#D38A00]">
                {slide.type === "verified" && <UserCheck size={20} />}
                {slide.type === "tracking" && <MapPin size={20} />}
                {slide.type === "overview" && <Navigation size={20} />}
                {slide.type === "guardian" && <MapPin size={20} />}
              </div>

              <div>
                <p className="text-[13px] font-black text-black">{slide.badge}</p>
                <p className="mt-0.5 text-[10px] text-[#8E8173]">
                  Built into every ASAN journey
                </p>
              </div>
            </div>

            <ChevronRight size={18} className="text-[#C89B3C]" />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {slides.map((item, index) => (
            <span
              key={item.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-7 bg-[#FFB400]"
                  : "w-2 bg-[#E8DECB]"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={back}
            disabled={isFirst}
            className={`flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[18px] border transition ${
              isFirst
                ? "pointer-events-none border-transparent bg-transparent opacity-0"
                : "border-[#E6D7BC] bg-white text-black shadow-sm active:scale-95"
            }`}
          >
            <ArrowLeft size={21} />
          </button>

          <button
            type="button"
            onClick={next}
            className={`flex h-[56px] flex-1 items-center rounded-[22px] border border-[#F3C04E] bg-[#FFF0BF] px-5 text-[13px] font-black text-black shadow-[0_8px_20px_rgba(201,142,19,0.10)] active:scale-[0.99] ${isLast ? "justify-between" : "justify-center gap-3"}`}
          >
            {isLast ? (
              <>
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFB400]">
                    <Play size={17} fill="black" className="text-black" />
                  </span>
                  <span>Get Started</span>
                </span>
                <ArrowRight size={19} className="shrink-0" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;