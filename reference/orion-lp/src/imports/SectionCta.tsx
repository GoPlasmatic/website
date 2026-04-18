import imgCtaBackgroundImage from "figma:asset/eecb46c390a687ad4db3fe02b46d0f9aaf117a29.png";

function CtaLabel() {
  return (
    <div className="content-stretch flex flex-col items-center pb-[0.59px] relative shrink-0 w-full" data-name="CTA Label">
      <div className="flex flex-col font-['DM_Mono:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#4cbd97] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Get involved</p>
      </div>
    </div>
  );
}

function CtaHeading() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="CTA Heading">
      <div className="flex flex-col font-['Montserrat:ExtraBold',sans-serif] font-extrabold justify-center leading-[0] relative shrink-0 text-[#ecf4f8] text-[46px] text-center tracking-[-0.5px] whitespace-nowrap">
        <p className="leading-[normal]">Shape what comes next.</p>
      </div>
    </div>
  );
}

function CtaDescription() {
  return (
    <div className="content-stretch flex flex-col items-center pt-[3.29px] relative shrink-0 w-full" data-name="CTA Description">
      <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#7fafc0] text-[15px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="leading-[24px] mb-0">Plasmatic is building in the open. Whether you’re an engineer, an organisation,</p>
        <p className="leading-[24px]">or an investor — there’s a place for you in this journey.</p>
      </div>
    </div>
  );
}

function AudienceCards() {
  return (
    <div className="gap-x-[14px] gap-y-[14px] grid grid-cols-[repeat(3,minmax(0,1fr))] grid-rows-[__176.02px_minmax(0,1fr)] h-[396.036px] pt-[30px] relative shrink-0 w-full" data-name="Audience Cards">
      <div className="bg-[#0f2030] col-1 h-[180.5px] relative rounded-[12px] row-1 shrink-0 w-[204px]" data-name="Card/Audience">
        <div aria-hidden="true" className="absolute border border-[rgba(17,159,205,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal leading-[22px] left-[19px] text-[#ecf4f8] text-[14px] top-[21px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
          Organisations
        </p>
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal h-[61px] leading-[22px] left-[19px] text-[#7fafc0] text-[14px] top-[44px] w-[166px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Early access to Orion for platform and engineering teams building at scale.
        </p>
        <p className="absolute font-['DM_Mono:Regular','Noto_Sans_Symbols:Regular',sans-serif] leading-[20px] left-[19px] text-[#119fcd] text-[12px] top-[140px] whitespace-nowrap" style={{ fontVariationSettings: "'wght' 400" }}>
          enquiries@goplasmatic.io →
        </p>
      </div>
      <div className="bg-[#0f2030] col-2 h-[202.6px] relative rounded-[12px] row-1 shrink-0 w-[204px]" data-name="Card/Audience">
        <div aria-hidden="true" className="absolute border border-[rgba(17,159,205,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal leading-[22px] left-[19px] text-[#ecf4f8] text-[14px] top-[21px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
          Investors
        </p>
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal h-[61px] leading-[22px] left-[19px] text-[#7fafc0] text-[14px] top-[44px] w-[166px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Redefining how distributed systems are governed, controlled and evolved.
        </p>
        <p className="absolute font-['DM_Mono:Regular','Noto_Sans_Symbols:Regular',sans-serif] leading-[20px] left-[19px] text-[#119fcd] text-[12px] top-[140px] whitespace-nowrap" style={{ fontVariationSettings: "'wght' 400" }}>
          Get in touch →
        </p>
      </div>
      <div className="bg-[#0f2030] col-3 h-[180.6px] relative rounded-[12px] row-1 shrink-0 w-[204px]" data-name="Card/Audience">
        <div aria-hidden="true" className="absolute border border-[rgba(17,159,205,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal leading-[22px] left-[19px] text-[#ecf4f8] text-[14px] top-[21px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
          Developers
        </p>
        <p className="absolute font-['DM_Sans:Regular',sans-serif] font-normal h-[61px] leading-[22px] left-[19px] text-[#7fafc0] text-[14px] top-[44px] w-[166px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Explore repos, contribute, and shape the platform alongside the core team.
        </p>
        <p className="absolute font-['DM_Mono:Regular','Noto_Sans_Symbols:Regular',sans-serif] leading-[20px] left-[19px] text-[#119fcd] text-[12px] top-[140px] whitespace-nowrap" style={{ fontVariationSettings: "'wght' 400" }}>
          github.com/GoPlasmatic →
        </p>
      </div>
    </div>
  );
}

function CtaButtons() {
  return (
    <div className="content-start flex flex-wrap gap-[0px_12.01px] items-start justify-center pt-[26px] relative shrink-0 w-full" data-name="CTA Buttons">
      <div className="h-[52px] relative rounded-[10px] shrink-0 w-[228px]" style={{ backgroundImage: "linear-gradient(192.848deg, rgb(76, 189, 151) 14.645%, rgb(17, 159, 205) 85.355%)" }} data-name="Button">
        <div className="absolute flex flex-col font-['DM_Sans:Bold',sans-serif] font-bold inset-0 justify-center leading-[0] text-[#063b4c] text-[15px] text-center tracking-[1px]" style={{ fontVariationSettings: "'opsz' 14" }}>
          <p className="leading-[normal]">Request early access →</p>
        </div>
      </div>
      <div className="bg-[rgba(7,17,26,0)] h-[52px] relative rounded-[10px] shrink-0 w-[193px]" data-name="Button">
        <div aria-hidden="true" className="absolute border border-[rgba(17,159,205,0.22)] border-solid inset-0 pointer-events-none rounded-[10px]" />
        <div className="absolute flex flex-col font-['DM_Sans:Regular',sans-serif] font-normal inset-0 justify-center leading-[0] text-[#7fafc0] text-[15px] text-center" style={{ fontVariationSettings: "'opsz' 14" }}>
          <p className="leading-[24px]">Visit goplasmatic.io</p>
        </div>
      </div>
    </div>
  );
}

function CtaContent() {
  return (
    <div className="content-stretch flex flex-col gap-[14px] items-start max-w-[640px] relative shrink-0 w-full" data-name="CTA Content">
      <CtaLabel />
      <CtaHeading />
      <CtaDescription />
      <AudienceCards />
      <CtaButtons />
    </div>
  );
}

export default function SectionCta() {
  return (
    <div className="bg-[#07111a] content-stretch flex flex-col items-center pb-[120px] pt-[119px] px-8 relative size-full" data-name="Section — CTA">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center left-1/2 mix-blend-screen size-[1129.441px] top-[calc(50%-0.01px)]" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-8">
          <div className="opacity-10 relative size-[1000px]" data-name="CTA Background Image">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[85.9%] left-0 max-w-none top-[7.05%] w-full" src={imgCtaBackgroundImage} />
            </div>
          </div>
        </div>
      </div>
      <CtaContent />
    </div>
  );
}