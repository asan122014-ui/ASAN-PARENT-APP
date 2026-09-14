// src/components/Onboarding.jsx

import { useState } from "react";
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
  Siren,
  UserCheck,
  Video,
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
    eyebrow: "SAFETY FIRST",
    title: (
      <>
        Built for moments when{" "}
        <span className="text-[#F2A900]">safety matters most</span>
      </>
    ),
    description:
      "Stay connected with SOS support, trip alerts and safety-first ride monitoring.",
    type: "safety",
    badge: "PROTECTED",
  },
  {
    id: 4,
    eyebrow: "GUARDIAN VIEW",
    title: (
      <>
        See every important moment with{" "}
        <span className="text-[#F2A900]">confidence</span>
      </>
    ),
    description:
      "Get live guardian visibility along with pickup and drop confirmations during active trips.",
    type: "guardian",
    badge: "CONNECTED",
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
            <p className="mt-2 text-[20px] font-black text-black">
              School Route
            </p>
            <p className="mt-1 text-[12px] text-[#8E8173]">
              Home → School
            </p>
          </div>

          <span className="rounded-full bg-[#FFF0B8] px-3 py-1.5 text-[10px] font-black text-[#9B6400]">
            LIVE
          </span>
        </div>

        <div className="relative mt-5 h-[170px] overflow-hidden rounded-[20px] border border-[#F2E5D1] bg-[#FFF9EA]">
          <div className="absolute left-4 top-8 h-[2px] w-[170px] rotate-[16deg] bg-[#E9DEC9]" />
          <div className="absolute left-14 top-[86px] h-[2px] w-[170px] -rotate-[22deg] bg-[#E9DEC9]" />
          <div className="absolute left-[110px] top-[40px] h-[96px] w-[4px] rotate-[31deg] rounded-full bg-[#FFB400]" />

          <div className="absolute left-[114px] top-[75px] flex h-12 w-12 items-center justify-center rounded-2xl bg-black shadow-lg">
            <Navigation size={22} className="text-[#FFB400]" />
          </div>

          <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFB400]">
            <MapPin size={18} className="text-black" />
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-[13px] font-black text-black">Live Location</p>
              <p className="text-[10px] text-[#8E8173]">Updated just now</p>
            </div>

            <div className="flex items-end gap-1">
              <span className="h-2 w-1.5 rounded bg-[#FFB400]" />
              <span className="h-4 w-1.5 rounded bg-[#FFB400]" />
              <span className="h-6 w-1.5 rounded bg-[#FFB400]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SafetyVisual() {
  return (
    <div className="relative">
      <div className="rounded-[26px] border border-[#F6D995] bg-[#FFFDF8] p-5 shadow-[0_12px_30px_rgba(58,46,21,0.07)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A7850]">
              Safety status
            </p>
            <p className="mt-2 text-[20px] font-black text-black">
              Protected Ride
            </p>
            <p className="mt-1 text-[12px] text-[#8E8173]">
              Alerts • SOS • Live status
            </p>
          </div>

          <span className="rounded-full bg-[#FFF0B8] px-3 py-1.5 text-[10px] font-black text-[#9B6400]">
            PROTECTED
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[20px] border border-[#F1E7D8] bg-white p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFB400]">
              <Siren size={21} className="text-black" />
            </div>
            <p className="mt-4 text-[14px] font-black text-black">SOS Support</p>
            <p className="mt-1 text-[10px] text-[#8E8173]">
              One-tap emergency access
            </p>
          </div>

          <div className="rounded-[20px] border border-[#F1E7D8] bg-white p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF0B8]">
              <Bell size={21} className="text-[#D38A00]" />
            </div>
            <p className="mt-4 text-[14px] font-black text-black">Trip Alerts</p>
            <p className="mt-1 text-[10px] text-[#8E8173]">
              Instant ride notifications
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-[18px] border border-[#F4D99C] bg-[#FFF8E8] px-4 py-3">
          <ShieldCheck size={20} className="text-[#D38A00]" />
          <p className="text-[12px] font-bold text-[#7B5A1A]">
            Safety monitoring stays active during the trip
          </p>
        </div>
      </div>
    </div>
  );
}

function GuardianVisual() {
  return (
    <div className="relative">
      <div className="rounded-[26px] border border-[#F6D995] bg-[#FFFDF8] p-5 shadow-[0_12px_30px_rgba(58,46,21,0.07)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A7850]">
              Guardian view
            </p>
            <p className="mt-2 text-[20px] font-black text-black">
              Live Ride View
            </p>
            <p className="mt-1 text-[12px] text-[#8E8173]">
              Pickup • Journey • Drop
            </p>
          </div>

          <span className="rounded-full bg-[#FFF0B8] px-3 py-1.5 text-[10px] font-black text-[#9B6400]">
            CONNECTED
          </span>
        </div>

        <div className="mt-5 overflow-hidden rounded-[20px] border border-[#F1E7D8] bg-black">
          <div className="flex h-[120px] items-center justify-center bg-gradient-to-br from-[#222] to-black">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFB400]">
              <Video size={30} className="text-black" />
            </div>
          </div>

          <div className="flex items-center justify-between bg-white px-4 py-3">
            <div>
              <p className="text-[13px] font-black text-black">Live Guardian View</p>
              <p className="text-[10px] text-[#8E8173]">Trip active now</p>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <StatusMiniCard time="7:45 AM" title="Picked Up" status="Confirmed" />
          <StatusMiniCard time="3:15 PM" title="Dropped" status="Confirmed" />
        </div>
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
    case "safety":
      return <SafetyVisual />;
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
                {slide.type === "safety" && <ShieldCheck size={20} />}
                {slide.type === "guardian" && <Video size={20} />}
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
            className="flex h-[56px] flex-1 items-center justify-center gap-3 rounded-[22px] border border-[#F3C04E] bg-[#FFF0BF] px-5 text-[13px] font-black text-black shadow-[0_8px_20px_rgba(201,142,19,0.10)] active:scale-[0.99]"
          >
            {isLast ? (
              <>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFB400]">
                  <Play size={17} fill="black" className="text-black" />
                </span>
                Get Started
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