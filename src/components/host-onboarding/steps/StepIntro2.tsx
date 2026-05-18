export function StepIntro2() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between min-h-[70vh] gap-12 px-6 max-w-6xl mx-auto">
      <div className="lg:w-2/5">
        <p className="text-sm font-semibold text-foreground mb-2">Step 2</p>
        <h1 className="text-3xl md:text-[40px] leading-tight font-extrabold tracking-tight text-foreground">
          Make your place stand out
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed">
          In this step, you'll add some of the amenities your place offers, plus 5 or more photos. Then, you'll create a title and description.
        </p>
      </div>
      
      <div className="lg:w-3/5 flex items-center justify-center">
        <img 
          src="/path-to-your-image/intro-step-2.png" 
          alt="Isometric view of a house interior" 
          className="w-full h-auto max-w-[600px] object-contain"
        />
      </div>
    </div>
  );
}
