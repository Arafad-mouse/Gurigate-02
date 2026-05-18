export function StepWelcome() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between min-h-[70vh] gap-12 px-6 max-w-6xl mx-auto">
      <div className="lg:w-1/2">
        <h1 className="text-3xl md:text-[46px] leading-tight font-extrabold tracking-tight text-foreground">
          It's easy to get started
        </h1>
      </div>
      <div className="lg:w-1/2 flex flex-col gap-0">
        {[
          {
            num: 1,
            title: "Tell us about your place",
            desc: "Share some basic info, like where it is and how many guests can stay.",
            icon: (
              <svg className="w-10 h-10 text-host-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V8.25l-9-6.75-9 6.75V21h4.5" />
              </svg>
            ),
          },
          {
            num: 2,
            title: "Make it stand out",
            desc: "Add 5 or more photos plus a title and description\u2014we'll help you out.",
            icon: (
              <svg className="w-10 h-10 text-host-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            ),
          },
          {
            num: 3,
            title: "Finish up and publish",
            desc: "Choose a starting price, verify a few details, then publish your listing.",
            icon: (
              <svg className="w-10 h-10 text-host-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" />
              </svg>
            ),
          },
        ].map((step, i) => (
          <div key={step.num} className={`flex items-start gap-5 py-6 ${i < 2 ? "border-b border-border" : ""}`}>
            <span className="text-lg font-semibold text-foreground mt-0.5">{step.num}</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{step.desc}</p>
            </div>
            {step.icon}
          </div>
        ))}
      </div>
    </div>
  );
}
