export function StepIntro3() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between min-h-[70vh] gap-12 px-6 max-w-6xl mx-auto">
      <div className="lg:w-2/5">
        <p className="text-sm font-semibold text-[#BA0036] mb-2 font-mono">Step 3</p>
        <h1 className="text-3xl md:text-[40px] leading-tight font-extrabold tracking-tight text-gray-900">
          Finish up and publish
        </h1>
        <p className="text-gray-500 mt-4 text-base leading-relaxed">
          Finally, you'll choose booking settings, set up pricing, and publish your listing.
        </p>
      </div>
      
      <div className="lg:w-3/5 flex items-center justify-center w-full">
        <img 
          src="/step-3.jfif" // ✅ Fixed: Pointing directly to your public step-3 asset
          alt="Finish up and publish graphics" 
          className="w-full h-auto max-w-[550px] object-contain rounded-2xl"
        />
      </div>
    </div>
  );
}
