export function StepIntro1() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between min-h-[70vh] gap-12 px-6 max-w-6xl mx-auto">
      <div className="lg:w-2/5">
        <p className="text-sm font-semibold text-foreground mb-2">Step 1</p>
        <h1 className="text-3xl md:text-[40px] leading-tight font-extrabold tracking-tight text-foreground">
          Tell us about your place
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed">
          In this step, we'll ask you which type of property you have and if guests will book the entire place or just a room. Then let us know the location and how many guests can stay.
        </p>
      </div>
      <div className="lg:w-3/5 flex items-center justify-center">
        <svg className="w-32 h-32 text-host-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V8.25l-9-6.75-9 6.75V21h4.5" />
        </svg>
      </div>
    </div>
  );
}
