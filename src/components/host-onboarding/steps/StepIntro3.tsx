export function StepIntro3() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between min-h-[70vh] gap-12 px-6 max-w-6xl mx-auto">
      <div className="lg:w-2/5">
        <p className="text-sm font-semibold text-foreground mb-2">Step 3</p>
        <h1 className="text-3xl md:text-[40px] leading-tight font-extrabold tracking-tight text-foreground">
          Finish up and publish
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed">
          Finally, you'll choose booking settings, set up pricing, and publish your listing.
        </p>
      </div>
      <div className="lg:w-3/5 flex items-center justify-center">
        <svg className="w-32 h-32 text-host-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
    </div>
  );
}
