import imgImage from "figma:asset/a1d83d1cdc66369147d4771b2093242954e9b136.png";
import { Zap, Building2, Search, Link2, Bot } from "lucide-react";

function OrionLabel() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.59px] relative shrink-0 w-full" data-name="Orion Label">
      <div className="flex flex-col font-['DM_Mono:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3d6b7d] text-[12px] w-full">
        <p className="leading-[20px]">Orion — Business Runtime Platform</p>
      </div>
    </div>
  );
}

function OrionHeading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Orion Heading">
      <div className="flex flex-col font-['Montserrat:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ecf4f8] text-[46px] tracking-[-0.5px] w-full">
        <p className="leading-[normal] mb-0">Control how your</p>
        <p className="leading-[normal] mb-0">systems behave.</p>
        <p className="leading-[normal]">Without touching code.</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[0.75px] relative size-full">
        <div className="flex flex-col font-['DM_Sans:Light',sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#7fafc0] text-[0px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
          <p className="leading-[25.5px] mb-0 text-[15px]" style={{ fontVariationSettings: "'opsz' 14" }}>
            Business logic buried inside microservices means every change needs
          </p>
          <p className="mb-0 text-[15px]">
            <span className="font-['DM_Sans:Light',sans-serif] font-light leading-[25.5px] text-[#7fafc0]" style={{ fontVariationSettings: "'opsz' 14" }}>{`an engineer, a PR, and a release cycle. `}</span>
            <span className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[25.5px] text-[#ecf4f8]" style={{ fontVariationSettings: "'opsz' 14" }}>
              Orion externalises that logic
            </span>
            <span className="font-['DM_Sans:Light',sans-serif] font-light leading-[25.5px] text-[#7fafc0]" style={{ fontVariationSettings: "'opsz' 14" }}>{` into`}</span>
          </p>
          <p className="leading-[25.5px] mb-0 text-[15px]" style={{ fontVariationSettings: "'opsz' 14" }}>
            a governed runtime layer — giving you instant, traceable control over
          </p>
          <p className="leading-[25.5px] text-[15px]" style={{ fontVariationSettings: "'opsz' 14" }}>
            how your systems behave.
          </p>
        </div>
      </div>
    </div>
  );
}

function OrionDescriptionCard() {
  return (
    <div className="bg-[#0f2030] relative rounded-[12px] shrink-0 w-full" data-name="Orion Description Card">
      <div aria-hidden="true" className="absolute border-[rgba(17,159,205,0.1)] border-b border-r border-solid border-t inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col items-start pb-[23px] pl-[22px] pr-[23px] pt-[26.95px] relative size-full">
        <Container />
      </div>
    </div>
  );
}

function OrionLeftColumn() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[13.3px] items-start relative row-1 self-start shrink-0 w-[540px]" data-name="Orion Left Column">
      <OrionLabel />
      <OrionHeading />
      <OrionDescriptionCard />
      <div className="h-[52px] relative rounded-[10px] shrink-0 w-[228px]" style={{ backgroundImage: "linear-gradient(192.848deg, rgb(76, 189, 151) 14.645%, rgb(17, 159, 205) 85.355%)" }} data-name="Button">
        <div className="absolute flex flex-col font-['DM_Sans:Bold',sans-serif] font-bold inset-0 justify-center leading-[0] text-[#063b4c] text-[15px] text-center tracking-[1px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          <p className="leading-[normal]">Request early access →</p>
        </div>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute bg-[rgba(17,159,205,0.12)] left-[17px] overflow-clip rounded-[8px] size-[32px] top-[16px] flex items-center justify-center" data-name="Icon">
      <Zap className="text-[#ecf4f8]" size={16} />
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute bg-[rgba(17,159,205,0.12)] left-[17px] overflow-clip rounded-[8px] size-[32px] top-[16px] flex items-center justify-center" data-name="Icon">
      <Building2 className="text-[#ecf4f8]" size={16} />
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute bg-[rgba(17,159,205,0.12)] left-[17px] overflow-clip rounded-[8px] size-[32px] top-[16px] flex items-center justify-center" data-name="Icon">
      <Search className="text-[#ecf4f8]" size={16} />
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute bg-[rgba(17,159,205,0.12)] left-[17px] overflow-clip rounded-[8px] size-[32px] top-[16px] flex items-center justify-center" data-name="Icon">
      <Link2 className="text-[#ecf4f8]" size={16} />
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute bg-[rgba(17,159,205,0.12)] left-[17px] overflow-clip rounded-[8px] size-[32px] top-[16px] flex items-center justify-center" data-name="Icon">
      <Bot className="text-[#ecf4f8]" size={16} />
    </div>
  );
}

function OrionFeatureList() {
  return (
    <div className="content-stretch flex flex-col gap-[11px] items-start relative shrink-0 w-full" data-name="Orion Feature List">
      <div className="bg-[#0f2030] h-[110px] relative rounded-[12px] shrink-0 w-[540px]" data-name="Card/Feature">
        <div aria-hidden="true" className="absolute border border-[rgba(17,159,205,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
        <Icon />
        <p className="absolute font-['Montserrat:Bold',sans-serif] font-bold leading-[28px] left-[63px] text-[#ecf4f8] text-[18px] top-[14px] whitespace-nowrap">Instant system changes</p>
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal h-[40px] leading-[24px] left-[63px] text-[#7fafc0] text-[15px] top-[40px] w-[460px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Deploy logic changes in real time. No engineering cycles, no PRs, no release schedules.
        </p>
      </div>
      <div className="bg-[#0f2030] h-[110px] relative rounded-[12px] shrink-0 w-[540px]" data-name="Card/Feature">
        <div aria-hidden="true" className="absolute border border-[rgba(17,159,205,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
        <Icon1 />
        <p className="absolute font-['Montserrat:Bold',sans-serif] font-bold leading-[28px] left-[63px] text-[#ecf4f8] text-[18px] top-[14px] whitespace-nowrap">Governance at scale</p>
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal h-[40px] leading-[24px] left-[63px] text-[#7fafc0] text-[15px] top-[40px] w-[460px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Define standards once in a central layer. Every service enforces the same rules automatically.
        </p>
      </div>
      <div className="bg-[#0f2030] h-[110px] relative rounded-[12px] shrink-0 w-[540px]" data-name="Card/Feature">
        <div aria-hidden="true" className="absolute border border-[rgba(17,159,205,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
        <Icon2 />
        <p className="absolute font-['Montserrat:Bold',sans-serif] font-bold leading-[28px] left-[63px] text-[#ecf4f8] text-[18px] top-[14px] whitespace-nowrap">Full traceability</p>
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal h-[40px] leading-[24px] left-[63px] text-[#7fafc0] text-[15px] top-[40px] w-[460px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Every execution is versioned and traceable. Know exactly what ran, when, and why.
        </p>
      </div>
      <div className="bg-[#0f2030] h-[110px] relative rounded-[12px] shrink-0 w-[540px]" data-name="Card/Feature">
        <div aria-hidden="true" className="absolute border border-[rgba(17,159,205,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
        <Icon3 />
        <p className="absolute font-['Montserrat:Bold',sans-serif] font-bold leading-[28px] left-[63px] text-[#ecf4f8] text-[18px] top-[14px] whitespace-nowrap">Decoupled from services</p>
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal h-[40px] leading-[24px] left-[63px] text-[#7fafc0] text-[15px] top-[40px] w-[460px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Logic lives in the runtime layer, not inside microservices. Easier to own and evolve.
        </p>
      </div>
      <div className="bg-[#0f2030] h-[110px] relative rounded-[12px] shrink-0 w-[540px]" data-name="Card/Feature">
        <div aria-hidden="true" className="absolute border border-[rgba(17,159,205,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
        <Icon4 />
        <p className="absolute font-['Montserrat:Bold',sans-serif] font-bold leading-[28px] left-[63px] text-[#ecf4f8] text-[18px] top-[14px] whitespace-nowrap">Ready for AI systems</p>
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal h-[40px] leading-[24px] left-[63px] text-[#7fafc0] text-[15px] top-[40px] w-[460px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Govern AI-generated outputs at runtime. Apply rules and stay in control as AI accelerates your systems.
        </p>
      </div>
    </div>
  );
}

function OrionRightColumn() {
  return (
    <div className="col-2 content-stretch flex flex-col items-start justify-self-stretch relative row-1 self-start shrink-0" data-name="Orion Right Column">
      <OrionFeatureList />
    </div>
  );
}

function OrionContent() {
  return (
    <div className="gap-x-[80px] gap-y-[80px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[_1073.30px] h-[653px] relative shrink-0 w-full" data-name="Orion Content">
      <OrionLeftColumn />
      <OrionRightColumn />
    </div>
  );
}

export default function SectionOrion() {
  return (
    <div className="bg-[#07111a] content-stretch flex flex-col items-center px-8 py-[96px] relative size-full" data-name="Section — Orion">
      <div className="absolute bottom-[-196.12px] flex items-center justify-center mix-blend-screen right-[-135.82px] size-[711.636px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-12">
          <div className="opacity-22 relative size-[600px]" data-name="Image">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-full left-[5.05%] max-w-none top-0 w-[89.9%]" src={imgImage} />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] w-full">
        <OrionContent />
      </div>
    </div>
  );
}