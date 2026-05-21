export function StepIntro1() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between min-h-[70vh] gap-12 px-6 max-w-6xl mx-auto bg-white">
      <div className="lg:w-2/5">
        <p className="text-sm font-semibold text-[#BA0036] mb-2 font-mono">Step 1</p>
        <h1 className="text-3xl md:text-[40px] leading-tight font-extrabold tracking-tight text-gray-900">
          Tell us about your place
        </h1>
        <p className="text-gray-500 mt-4 text-base leading-relaxed">
          In this step, we'll ask you which type of property you have and if guests will book the entire place or just a room. Then let us know the location and how many guests can stay.
        </p>
      </div>
      <div className="lg:w-3/5 flex items-center justify-center w-full">
        <img 
          src="/original-step1-home.jpg" 
          alt="Isometric home layout" 
          className="w-full max-w-[550px] h-auto object-contain mix-blend-multiply" // ✅ Added blend mode
        />
      </div>
    </div>
  );
}
